package com.example.TvojGrad.services;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

@Service
public class GeminiInterestService {
    private static final String ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

    public Map<String, List<String>> analyze(String text) {
        if (text == null || text.trim().length() < 5) return emptyResult();
        String apiKey = firstNonBlank(System.getenv("GEMINI_API_KEY"), System.getenv("VITE_GEMINI_API_KEY"));
        if (apiKey == null) throw new IllegalStateException("GEMINI_API_KEY nije podešen na backend serveru");

        try {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("systemInstruction", Map.of("parts", List.of(Map.of("text", prompt()))));
            body.put("contents", List.of(Map.of("role", "user", "parts", List.of(Map.of(
                    "text", objectMapper.writeValueAsString(Map.of("opis_korisnika", text.trim())))))));
            body.put("generationConfig", Map.of(
                    "temperature", 0.1,
                    "responseMimeType", "application/json",
                    "responseJsonSchema", Map.of(
                            "type", "object",
                            "properties", Map.of(
                                    "interesovanja", Map.of("type", "array", "items", Map.of("type", "string"), "maxItems", 20),
                                    "neinteresovanja", Map.of("type", "array", "items", Map.of("type", "string"), "maxItems", 20)),
                            "required", List.of("interesovanja", "neinteresovanja"),
                            "additionalProperties", false)));

            HttpRequest request = HttpRequest.newBuilder(URI.create(ENDPOINT))
                    .timeout(Duration.ofSeconds(30))
                    .header("Content-Type", "application/json")
                    .header("x-goog-api-key", apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("Gemini API greška: HTTP " + response.statusCode());
            }
            JsonNode root = objectMapper.readTree(response.body());
            String jsonText = root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText();
            Map<String, List<String>> parsed = objectMapper.readValue(jsonText, new TypeReference<>() {});
            Map<String, List<String>> result = new LinkedHashMap<>();
            result.put("interesovanja", clean(parsed.get("interesovanja")));
            result.put("neinteresovanja", clean(parsed.get("neinteresovanja")));
            return result;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Gemini analiza je prekinuta", e);
        } catch (Exception e) {
            throw new IllegalStateException("Gemini analiza nije uspjela: " + e.getMessage(), e);
        }
    }

    private String prompt() {
        return """
                Analiziraš opis korisnika aplikacije za pronalaženje društva za događaje.
                Vrati isključivo JSON koji odgovara zadatoj šemi, na srpskom/crnogorskom latinicom.
                'interesovanja' su kratki, konkretni i kanonski pojmovi koje korisnik jasno voli ili podržava.
                'neinteresovanja' su kratki pojmovi koje korisnik jasno ne voli, izbjegava ili koji su razumno direktno suprotni jasno navedenoj preferenciji.
                Ako korisnik navede sportski klub koji voli, možeš dodati samo njegove široko poznate direktne rivalske klubove u neinteresovanja; ne izmišljaj rivalstva.
                Ne zaključuj političke stavove, vjeru, seksualnost, zdravlje, etničku pripadnost ili druge osjetljive osobine.
                Razumij negacije: 'ne volim fudbal' znači da je Fudbal u neinteresovanjima, ne u interesovanjima.
                Koristi najjednostavnije standardne imenice u jednini i najšire razumljive kategorije, bez nepotrebnih pridjeva.
                Obavezno kanonizuj sinonime uvijek isto: nogomet/football/soccer -> 'Fudbal'; basket/basketball -> 'Košarka'; rock/rok -> 'Rok muzika'; filmovi/bioskop -> 'Film'; gaming/igrice -> 'Video igre'.
                Ako dva izraza označavaju istu temu, vrati samo jedan standardni pojam. Ne vraćaj uže i šire duplikate poput 'Sport' i 'Fudbal' kada tekst govori samo o fudbalu.
                Primjeri poželjnih jednostavnih pojmova: 'Fudbal', 'Košarka', 'Muzika', 'Film', 'Knjige', 'Putovanja', 'Planinarenje', 'Tehnologija'.
                Ne ponavljaj pojmove i ne stavljaj isti pojam u obje liste. Maksimalno 20 pojmova po listi.
                """;
    }

    private List<String> clean(List<String> values) {
        if (values == null) return new ArrayList<>();
        LinkedHashSet<String> result = new LinkedHashSet<>();
        for (String value : values) {
            if (value != null && !value.isBlank()) result.add(value.trim());
            if (result.size() == 20) break;
        }
        return new ArrayList<>(result);
    }

    private Map<String, List<String>> emptyResult() {
        return Map.of("interesovanja", List.of(), "neinteresovanja", List.of());
    }

    private String firstNonBlank(String... values) {
        for (String value : values) if (value != null && !value.isBlank()) return value;
        return null;
    }
}
