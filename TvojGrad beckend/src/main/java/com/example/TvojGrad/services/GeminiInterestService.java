package com.example.TvojGrad.services;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.text.Normalizer;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

@Service
public class GeminiInterestService {
    private static final String ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    private final HttpClient devGeminiHttpClient = createDevGeminiHttpClient();

    public Map<String, List<String>> analyze(String text) {
        if (text == null || text.trim().length() < 5) return emptyResult();

        String apiKey = firstNonBlank(System.getenv("GEMINI_API_KEY"), System.getenv("VITE_GEMINI_API_KEY"));
        if (apiKey == null) return localAnalysis(text);

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
            HttpResponse<String> response = sendToGemini(request);
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("Gemini API greška: HTTP " + response.statusCode());
            }
            JsonNode root = objectMapper.readTree(response.body());
            String jsonText = root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText();
            Map<String, List<String>> parsed = objectMapper.readValue(jsonText, new TypeReference<>() {});
            return mergeWithLocal(parsed, text);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Gemini analiza je prekinuta", e);
        } catch (Exception e) {
            System.err.println("Gemini analiza nije dostupna, koristi se lokalna analiza: " + e.getMessage());
            return localAnalysis(text);
        }
    }

    private String prompt() {
        return """
                Analiziraš opis korisnika aplikacije za pronalaženje društva za događaje.
                Vrati isključivo JSON koji odgovara zadatoj šemi, na srpskom/crnogorskom latinicom.
                'interesovanja' su kratki, konkretni i kanonski pojmovi koje korisnik jasno voli ili podržava.
                'neinteresovanja' su kratki pojmovi koje korisnik jasno ne voli, izbjegava ili koji su razumno direktno suprotni jasno navedenoj preferenciji.
                Ako korisnik navede sportski klub koji voli ili za koji navija, dodaj samo njegove široko poznate direktne rivalske klubove u 'neinteresovanja'; ne izmišljaj rivalstva.
                Primjeri rivalstva: ako voli/navija za 'Crvena Zvezda', dodaj 'Partizan' u 'neinteresovanja'; ako voli/navija za 'Partizan', dodaj 'Crvena Zvezda' u 'neinteresovanja'; ako voli/navija za 'Mančester Junajted', dodaj 'Mančester Siti' u 'neinteresovanja'.
                Ne zaključuj političke stavove, vjeru, seksualnost, zdravlje, etničku pripadnost ili druge osjetljive osobine.
                Razumij negacije: 'ne volim fudbal' znači da je Fudbal u neinteresovanjima, ne u interesovanjima.
                Izvuci što više jasno navedenih korisnih pojmova iz cijelog opisa: aktivnosti, hobije, mjesta, gradove, države, klubove, hranu, pića, vrste događaja, sportove, stilove muzike i konkretne interese.
                Ne preskači jednostavne pojmove poput 'More', 'Kupanje', 'Plaža', 'Plivanje', 'Šetnja', 'Kafa', 'Koncerti'.
                Koristi najjednostavnije standardne imenice u jednini i najšire razumljive kategorije, bez nepotrebnih pridjeva.
                Vlastita imena, klubove, gradove, države i strane nazive vrati u ustaljenom domaćem obliku na našem jeziku, latinicom.
                Obavezno kanonizuj sinonime uvijek isto: mleko/mlijeko -> 'Mlijeko'; nogomet/football/soccer -> 'Fudbal'; basket/basketball -> 'Košarka'; Manchester United/Mančester United -> 'Mančester Junajted'; Manchester City/Mančester City -> 'Mančester Siti'; Liverpool -> 'Liverpul'; Vienna/Wien -> 'Beč'; Paris -> 'Pariz'; London -> 'London'; rock/rok -> 'Rok muzika'; filmovi/bioskop -> 'Film'; gaming/igrice -> 'Video igre'.
                Ako dva izraza označavaju istu temu, vrati samo jedan standardni pojam, da se korisnicima poklapaju riječi. Ne vraćaj sinonime kao odvojene pojmove.
                Ne vraćaj uže i šire duplikate poput 'Sport' i 'Fudbal' kada tekst govori samo o fudbalu, ali ako korisnik jasno kaže i opštu i posebnu stvar, možeš vratiti obje.
                Primjeri poželjnih jednostavnih pojmova: 'Fudbal', 'Košarka', 'Muzika', 'Film', 'Knjige', 'Putovanja', 'Planinarenje', 'Tehnologija'.
                Ne ponavljaj pojmove i ne stavljaj isti pojam u obje liste. Maksimalno 20 pojmova po listi.
                """;
    }

    private HttpResponse<String> sendToGemini(HttpRequest request) throws Exception {
        try {
            return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (Exception error) {
            if (!isCertificateProblem(error)) throw error;
            System.err.println("Gemini SSL sertifikat nije prihvaćen kroz Java truststore; ponavljam Gemini poziv preko dev SSL klijenta.");
            return devGeminiHttpClient.send(request, HttpResponse.BodyHandlers.ofString());
        }
    }

    private boolean isCertificateProblem(Throwable error) {
        Throwable current = error;
        while (current != null) {
            String message = current.getMessage();
            if (message != null && (
                    message.contains("PKIX path building failed")
                            || message.contains("certificate_unknown")
                            || message.contains("unable to find valid certification path"))) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }

    private HttpClient createDevGeminiHttpClient() {
        try {
            TrustManager[] trustAll = new TrustManager[]{
                    new X509TrustManager() {
                        @Override
                        public void checkClientTrusted(X509Certificate[] chain, String authType) {
                        }

                        @Override
                        public void checkServerTrusted(X509Certificate[] chain, String authType) {
                        }

                        @Override
                        public X509Certificate[] getAcceptedIssuers() {
                            return new X509Certificate[0];
                        }
                    }
            };
            SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(null, trustAll, new SecureRandom());
            return HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(10))
                    .sslContext(sslContext)
                    .build();
        } catch (Exception error) {
            throw new IllegalStateException("Ne mogu da napravim dev Gemini SSL klijent", error);
        }
    }

    private Map<String, List<String>> localAnalysis(String text) {
        LinkedHashSet<String> interests = new LinkedHashSet<>();
        LinkedHashSet<String> dislikes = new LinkedHashSet<>();
        String normalized = normalize(text);

        Map<String, List<String>> topics = new LinkedHashMap<>();
        topics.put("Košarka", List.of("kosarka", "kosarku", "basket", "basketball"));
        topics.put("Fudbal", List.of("fudbal", "fudbala", "nogomet", "football", "soccer"));
        topics.put("Sport", List.of("sport", "sportove", "sportovi", "sportski"));
        topics.put("Crvena Zvezda", List.of("crvena zvezda", "crvenu zvezdu", "zvezda", "zvezdu", "red star"));
        topics.put("Partizan", List.of("partizan"));
        topics.put("Mančester Junajted", List.of("manchester united", "mancester united", "manchester junajted", "mancester junajted", "mančester united", "mančester junajted"));
        topics.put("Mančester Siti", List.of("manchester city", "mancester city", "manchester siti", "mancester siti", "mančester city", "mančester siti"));
        topics.put("Liverpul", List.of("liverpool", "liverpul"));
        topics.put("Muzika", List.of("muzika", "music"));
        topics.put("Rep muzika", List.of("rep muzika", "rap muzika", "rep", "rap"));
        topics.put("Rok muzika", List.of("rok muzika", "rock muzika", "rok", "rock"));
        topics.put("Film", List.of("film", "filmovi", "bioskop"));
        topics.put("Serije", List.of("serija", "serije"));
        topics.put("Šetnja", List.of("setnja", "setam", "šetnja", "šetam"));
        topics.put("Putovanja", List.of("putovanje", "putovanja", "putujem", "travel"));
        topics.put("Priroda", List.of("priroda", "nature"));
        topics.put("Kultura", List.of("kultura", "kulturni"));
        topics.put("Edukacija", List.of("edukacija", "ucenje", "učenje", "predavanje", "radionica"));
        topics.put("Tehnologija", List.of("tehnologija", "programiranje", "it", "coding"));
        topics.put("Knjige", List.of("knjiga", "knjige", "citanje", "čitanje"));
        topics.put("Video igre", List.of("video igre", "igrice", "gaming", "gejming"));
        topics.put("Koncerti", List.of("koncert", "koncerti"));
        topics.put("Pozorište", List.of("pozoriste", "pozorište", "teatar"));
        topics.put("More", List.of("more", "mora", "sea"));
        topics.put("Kupanje", List.of("kupanje", "kupam", "kupati", "plivanje", "plivam", "bazen"));
        topics.put("Plaža", List.of("plaza", "plaža", "beach"));
        topics.put("Kafa", List.of("kafa", "kafu", "coffee"));
        topics.put("Mlijeko", List.of("mlijeko", "mleko", "milk"));
        topics.put("Beč", List.of("bec", "beč", "vienna", "wien"));
        topics.put("Pariz", List.of("pariz", "paris"));
        topics.put("Rim", List.of("rim", "rome", "roma"));
        topics.put("Njujork", List.of("njujork", "new york", "nyc"));

        for (Map.Entry<String, List<String>> topic : topics.entrySet()) {
            for (String variant : topic.getValue()) {
                String normalizedVariant = normalize(variant);
                if (containsTerm(normalized, normalizedVariant)) {
                    if (isNegated(normalized, normalizedVariant)) {
                        dislikes.add(topic.getKey());
                    } else {
                        interests.add(topic.getKey());
                    }
                    break;
                }
            }
        }

        interests.removeAll(dislikes);
        applyKnownRivals(interests, dislikes);
        interests.removeAll(dislikes);

        Map<String, List<String>> result = new LinkedHashMap<>();
        result.put("interesovanja", limit(interests, 20));
        result.put("neinteresovanja", limit(dislikes, 20));
        return result;
    }

    private Map<String, List<String>> mergeWithLocal(Map<String, List<String>> parsed, String text) {
        Map<String, List<String>> local = localAnalysis(text);
        LinkedHashSet<String> interests = new LinkedHashSet<>(clean(parsed.get("interesovanja")));
        LinkedHashSet<String> dislikes = new LinkedHashSet<>(clean(parsed.get("neinteresovanja")));

        interests.addAll(local.getOrDefault("interesovanja", List.of()));
        dislikes.addAll(local.getOrDefault("neinteresovanja", List.of()));
        applyKnownRivals(interests, dislikes);
        interests.removeAll(dislikes);

        Map<String, List<String>> result = new LinkedHashMap<>();
        result.put("interesovanja", limit(interests, 20));
        result.put("neinteresovanja", limit(dislikes, 20));
        return result;
    }

    private List<String> clean(List<String> values) {
        if (values == null) return new ArrayList<>();
        LinkedHashSet<String> result = new LinkedHashSet<>();
        for (String value : values) {
            String canonical = canonicalDisplay(value);
            if (!canonical.isBlank()) result.add(canonical);
            if (result.size() == 20) break;
        }
        return new ArrayList<>(result);
    }

    private void applyKnownRivals(LinkedHashSet<String> interests, LinkedHashSet<String> dislikes) {
        addRivalIfInterested(interests, dislikes, "Crvena Zvezda", "Partizan");
        addRivalIfInterested(interests, dislikes, "Partizan", "Crvena Zvezda");
        addRivalIfInterested(interests, dislikes, "Mančester Junajted", "Mančester Siti");
        addRivalIfInterested(interests, dislikes, "Mančester Siti", "Mančester Junajted");
        addRivalIfInterested(interests, dislikes, "Liverpul", "Mančester Junajted");
    }

    private void addRivalIfInterested(LinkedHashSet<String> interests, LinkedHashSet<String> dislikes, String club, String rival) {
        if (interests.contains(club) && !interests.contains(rival)) {
            dislikes.add(rival);
        }
    }

    private List<String> limit(LinkedHashSet<String> values, int max) {
        List<String> result = new ArrayList<>();
        for (String value : values) {
            result.add(value);
            if (result.size() == max) break;
        }
        return result;
    }

    private boolean containsTerm(String text, String term) {
        if (term.length() <= 2) {
            return Pattern.compile("(^|\\W)" + Pattern.quote(term) + "(\\W|$)").matcher(text).find();
        }
        return text.contains(term);
    }

    private boolean isNegated(String text, String term) {
        int index = text.indexOf(term);
        if (index < 0) return false;

        int from = Math.max(0, index - 45);
        String before = text.substring(from, index);
        return before.matches("(?s).*\\b(ne\\s+volim|ne\\s+voli|ne\\s+volimo|mrzim|ne\\s+zanima|ne\\s+interesuje|izbjegavam|izbegavam|ne\\s+podnosim)\\b.*");
    }

    private Map<String, List<String>> emptyResult() {
        return Map.of("interesovanja", List.of(), "neinteresovanja", List.of());
    }

    private String normalize(String value) {
        return Normalizer.normalize(value == null ? "" : value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replace('đ', 'd');
    }

    private String canonicalDisplay(String value) {
        if (value == null || value.isBlank()) return "";
        String normalized = normalize(value).trim().replaceAll("\\s+", " ");
        return switch (normalized) {
            case "kosarka", "kosarku", "kosarke", "basket", "basketball", "basketbal" -> "Košarka";
            case "fudbal", "fudbala", "nogomet", "football", "soccer", "lopta" -> "Fudbal";
            case "tenis", "tennis" -> "Tenis";
            case "odbojka", "volleyball" -> "Odbojka";
            case "rukomet", "handball" -> "Rukomet";
            case "trcanje", "trcim", "jogging", "running", "run" -> "Trčanje";
            case "teretana", "gym", "fitness", "fitnes", "vjezbanje", "vezbanje", "workout" -> "Teretana";
            case "biciklizam", "bicikl", "bajs", "bike", "cycling" -> "Biciklizam";
            case "planinarenje", "hiking", "hajking" -> "Planinarenje";
            case "skijanje", "skiing", "ski" -> "Skijanje";
            case "sport", "sportovi", "sportove", "sportski" -> "Sport";
            case "crvena zvezda", "crvenu zvezdu", "zvezda", "zvezdu", "red star" -> "Crvena Zvezda";
            case "partizan" -> "Partizan";
            case "manchester united", "mancester united", "manchester junajted", "mancester junajted",
                    "mancester", "manchester", "mancester utd", "manchester utd", "man utd", "man united" -> "Mančester Junajted";
            case "manchester city", "mancester city", "manchester siti", "mancester siti",
                    "man city", "man siti" -> "Mančester Siti";
            case "liverpool", "liverpul" -> "Liverpul";
            case "muzika", "music", "pjesme", "pesme" -> "Muzika";
            case "rep", "rap", "rep muzika", "rap muzika" -> "Rep muzika";
            case "hip hop", "hiphop", "hip-hop" -> "Hip-hop";
            case "rok", "rock", "rok muzika", "rock muzika" -> "Rok muzika";
            case "pop", "pop muzika" -> "Pop muzika";
            case "narodna", "narodna muzika", "folk", "folk muzika" -> "Narodna muzika";
            case "elektronska muzika", "electronic", "edm", "tehno", "techno", "house" -> "Elektronska muzika";
            case "jazz", "dzez", "džez" -> "Džez";
            case "film", "filmovi", "bioskop" -> "Film";
            case "serija", "serije" -> "Serije";
            case "pozoriste", "teatar" -> "Pozorište";
            case "umjetnost", "umetnost", "art" -> "Umjetnost";
            case "fotografija", "slikanje", "photography" -> "Fotografija";
            case "ples", "dance", "dancing" -> "Ples";
            case "setnja", "setam" -> "Šetnja";
            case "putovanje", "putovanja", "putujem", "travel" -> "Putovanja";
            case "avantura", "adventure" -> "Avantura";
            case "priroda", "nature" -> "Priroda";
            case "kultura", "kulturni" -> "Kultura";
            case "edukacija", "ucenje", "predavanje", "radionica", "kurs", "course", "seminar" -> "Edukacija";
            case "tehnologija", "tech", "technology" -> "Tehnologija";
            case "programiranje", "coding", "kodiranje", "software", "softver" -> "Programiranje";
            case "racunari", "računari", "kompjuteri", "computers", "computer" -> "Računari";
            case "ai", "artificial intelligence", "vjestacka inteligencija", "vestacka inteligencija", "umjetna inteligencija" -> "Vještačka inteligencija";
            case "knjiga", "knjige", "citanje", "reading", "book", "books" -> "Knjige";
            case "video igre", "video igrice", "igrice", "igre", "gaming", "gejming", "games" -> "Video igre";
            case "drustvene igre", "društvene igre", "board games", "boardgames" -> "Društvene igre";
            case "koncert", "koncerti" -> "Koncerti";
            case "festival", "festivali" -> "Festivali";
            case "nocni zivot", "noćni život", "izlazak", "izlasci", "party", "parti", "zurke", "žurke" -> "Izlasci";
            case "kafic", "kafić", "cafe" -> "Kafić";
            case "restoran", "restaurant" -> "Restoran";
            case "more", "mora", "sea" -> "More";
            case "kupanje", "kupam", "kupati", "plivanje", "plivam", "bazen", "swimming", "pool" -> "Kupanje";
            case "plaza", "beach", "beaches" -> "Plaža";
            case "kafa", "kafu", "coffee", "espresso", "espreso" -> "Kafa";
            case "caj", "čaj", "tea" -> "Čaj";
            case "sok", "juice" -> "Sok";
            case "mlijeko", "mleko", "milk" -> "Mlijeko";
            case "voda", "water" -> "Voda";
            case "pivo", "beer" -> "Pivo";
            case "vino", "wine" -> "Vino";
            case "rakija", "brandy" -> "Rakija";
            case "hrana", "food" -> "Hrana";
            case "pizza", "pica" -> "Pica";
            case "rostilj", "roštilj", "bbq", "barbecue" -> "Roštilj";
            case "cevapi", "ćevapi", "kebapi", "kebab" -> "Ćevapi";
            case "burek" -> "Burek";
            case "pasta", "testenina", "tjestenina" -> "Pasta";
            case "hamburger", "burger" -> "Burger";
            case "sushi", "susi", "suši" -> "Suši";
            case "sladoled", "ice cream" -> "Sladoled";
            case "cokolada", "čokolada", "chocolate" -> "Čokolada";
            case "bec", "vienna", "wien" -> "Beč";
            case "pariz", "paris" -> "Pariz";
            case "london" -> "London";
            case "beograd", "belgrade" -> "Beograd";
            case "zagreb" -> "Zagreb";
            case "sarajevo" -> "Sarajevo";
            case "ljubljana", "liubliana" -> "Ljubljana";
            case "skoplje", "skopje" -> "Skoplje";
            case "istanbul", "carigrad" -> "Istanbul";
            case "berlin" -> "Berlin";
            case "madrid" -> "Madrid";
            case "barselona", "barcelona" -> "Barselona";
            case "amsterdam" -> "Amsterdam";
            case "brisel", "brussels", "bruxelles" -> "Brisel";
            case "lisabon", "lisbon" -> "Lisabon";
            case "kopenhagen", "copenhagen" -> "Kopenhagen";
            case "stokholm", "stockholm" -> "Stokholm";
            case "cirih", "zurich", "zürich" -> "Cirih";
            case "zeneva", "ženeva", "geneva" -> "Ženeva";
            case "rim", "rome", "roma" -> "Rim";
            case "njujork", "new york", "nyc" -> "Njujork";
            case "minhen", "munich", "munchen", "muenchen" -> "Minhen";
            case "moskva", "moscow" -> "Moskva";
            case "solun", "thessaloniki" -> "Solun";
            case "atina", "athens" -> "Atina";
            case "prag", "prague", "praha" -> "Prag";
            case "varsava", "warsaw", "warszawa" -> "Varšava";
            case "budimpesta", "budapest" -> "Budimpešta";
            case "venecija", "venice", "venezia" -> "Venecija";
            case "firenca", "florence", "firenze" -> "Firenca";
            case "becici", "bečići" -> "Bečići";
            case "crna gora", "montenegro" -> "Crna Gora";
            case "srbija", "serbia" -> "Srbija";
            case "hrvatska", "croatia" -> "Hrvatska";
            case "bosna", "bosna i hercegovina", "bih", "bosnia" -> "Bosna i Hercegovina";
            case "italija", "italy" -> "Italija";
            case "spanija", "španija", "spain" -> "Španija";
            case "francuska", "france" -> "Francuska";
            case "njemacka", "njemačka", "nemacka", "germany" -> "Njemačka";
            case "austrija", "austria" -> "Austrija";
            case "grcka", "grčka", "greece" -> "Grčka";
            case "podgorica" -> "Podgorica";
            case "bar" -> "Bar";
            case "budva" -> "Budva";
            case "niksic" -> "Nikšić";
            case "cetinja", "cetinje" -> "Cetinje";
            case "herceg novi" -> "Herceg Novi";
            case "bijelo polje" -> "Bijelo Polje";
            case "berane" -> "Berane";
            case "pljevlja" -> "Pljevlja";
            case "ulcinj" -> "Ulcinj";
            case "tivat" -> "Tivat";
            case "kotor" -> "Kotor";
            case "danilovgrad" -> "Danilovgrad";
            case "mojkovac" -> "Mojkovac";
            case "kolasin" -> "Kolašin";
            case "rozaje" -> "Rožaje";
            case "plav" -> "Plav";
            case "zabljak" -> "Žabljak";
            case "savnik" -> "Šavnik";
            case "andrijevica" -> "Andrijevica";
            case "petnjica" -> "Petnjica";
            case "gusinje" -> "Gusinje";
            case "tuzi" -> "Tuzi";
            case "zeta" -> "Zeta";
            default -> titleCase(value.trim().replaceAll("\\s+", " "));
        };
    }

    private String titleCase(String value) {
        String[] parts = value.split("\\s+");
        List<String> result = new ArrayList<>();
        for (String part : parts) {
            if (part.isBlank()) continue;
            result.add(part.substring(0, 1).toUpperCase(Locale.ROOT) + part.substring(1));
        }
        return String.join(" ", result);
    }

    private String firstNonBlank(String... values) {
        for (String value : values) if (value != null && !value.isBlank()) return value;
        return null;
    }
}
