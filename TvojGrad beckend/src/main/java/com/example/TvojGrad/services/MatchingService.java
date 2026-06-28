package com.example.TvojGrad.services;

import com.example.TvojGrad.DBUtil;
import com.example.TvojGrad.models.Korisnik;
import com.example.TvojGrad.models.PodjiSaMnomPrijava;
import com.example.TvojGrad.repositories.KorisnikRepositories;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class MatchingService {
    private final KorisnikRepositories korisnikRepositories;

    public MatchingService(KorisnikRepositories korisnikRepositories) {
        this.korisnikRepositories = korisnikRepositories;
    }

    public List<PodjiSaMnomPrijava> dodajPodudaranja(List<PodjiSaMnomPrijava> prijave, Integer viewerId) {
        if (viewerId == null || prijave == null) return prijave;
        Korisnik viewer = korisnikRepositories.getKorisnikById(viewerId);
        if (viewer == null || viewer.getID() == null) return prijave;
        Set<Integer> viewerFavorites = favorites(viewerId);

        for (PodjiSaMnomPrijava prijava : prijave) {
            Korisnik candidate = prijava.getKorisnik();
            if (candidate == null || candidate.getID() == null) continue;
            if (viewer.getID().equals(candidate.getID())) {
                prijava.setPodudaranje(null);
                prijava.setKategorija_podudaranja(null);
                prijava.setRazlozi_podudaranja(null);
                continue;
            }
            Match match = calculate(viewer, candidate, viewerFavorites, favorites(candidate.getID()));
            prijava.setPodudaranje(match.score);
            prijava.setKategorija_podudaranja(match.label);
            prijava.setRazlozi_podudaranja(match.reasons);
        }
        prijave.sort((a, b) -> Integer.compare(
                b.getPodudaranje() == null ? -1 : b.getPodudaranje(),
                a.getPodudaranje() == null ? -1 : a.getPodudaranje()));
        return prijave;
    }

    public java.util.Map<String, Object> podudaranjeKorisnika(int viewerId, int candidateId) {
        Korisnik viewer = korisnikRepositories.getKorisnikById(viewerId);
        Korisnik candidate = korisnikRepositories.getKorisnikById(candidateId);
        java.util.Map<String, Object> result = new java.util.LinkedHashMap<>();
        if (viewer == null || candidate == null || viewer.getID() == null || candidate.getID() == null || viewerId == candidateId) {
            return result;
        }
        Match match = calculate(viewer, candidate, favorites(viewerId), favorites(candidateId));
        result.put("Podudaranje", match.score);
        result.put("Kategorija_podudaranja", match.label);
        result.put("Razlozi_podudaranja", match.reasons);
        return result;
    }

    private Match calculate(Korisnik viewer, Korisnik candidate, Set<Integer> viewerFavorites, Set<Integer> candidateFavorites) {
        int score = 0;
        List<String> reasons = new ArrayList<>();
        String viewerCity = normalize(viewer.getGrad());
        String candidateCity = normalize(candidate.getGrad());
        if (!viewerCity.isEmpty() && viewerCity.equals(candidateCity)) {
            score += 10;
            reasons.add("Isti grad: " + candidate.getGrad());
        }

        Set<String> viewerInterests = interests(viewer.getInteresovanja());
        Set<String> candidateInterests = interests(candidate.getInteresovanja());
        int interestScore = 0;
        Set<String> commonInterests = intersectionNormalized(viewerInterests, candidateInterests);
        Set<String> allInterests = union(viewerInterests, candidateInterests);
        long distinctInterestCount = allInterests.stream().map(this::normalize).distinct().count();
        long viewerInterestCount = viewerInterests.stream().map(this::normalize).distinct().count();
        long candidateInterestCount = candidateInterests.stream().map(this::normalize).distinct().count();
        long smallerInterestCount = Math.min(viewerInterestCount, candidateInterestCount);
        if (distinctInterestCount > 0 && smallerInterestCount > 0) {
            double smallerListCoverage = (double) commonInterests.size() / smallerInterestCount;
            double jaccardSimilarity = (double) commonInterests.size() / distinctInterestCount;
            int sharedCountBonus = Math.min(10, commonInterests.size() * 2);
            interestScore += (int) Math.round((45.0 * smallerListCoverage) + (20.0 * jaccardSimilarity) + sharedCountBonus);
        }
        if (!commonInterests.isEmpty()) {
            reasons.add("Zajednička interesovanja: " + String.join(", ", commonInterests));
        }

        Set<String> relatedGroups = intersection(interestGroups(viewerInterests), interestGroups(candidateInterests));
        if (commonInterests.isEmpty() && !relatedGroups.isEmpty()) {
            interestScore += Math.min(6, relatedGroups.size() * 3);
            reasons.add("Srodna interesovanja: " + relatedGroups.stream().map(this::groupLabel).collect(Collectors.joining(", ")));
        }

        Set<String> conflicts = union(
                intersectionNormalized(viewerInterests, interests(candidate.getNeinteresovanja())),
                intersectionNormalized(candidateInterests, interests(viewer.getNeinteresovanja())));
        Set<String> commonDislikes = intersectionNormalized(
                interests(viewer.getNeinteresovanja()), interests(candidate.getNeinteresovanja()));
        if (!commonDislikes.isEmpty()) {
            interestScore += Math.min(3, commonDislikes.size());
            reasons.add("Slicne preference: oboje ne vole " + String.join(", ", commonDislikes));
        }
        Set<Integer> commonFavorites = intersection(viewerFavorites, candidateFavorites);
        Set<Integer> allFavorites = union(viewerFavorites, candidateFavorites);
        if (!allFavorites.isEmpty()) {
            score += (int) Math.round(15.0 * commonFavorites.size() / allFavorites.size());
        }
        if (!commonFavorites.isEmpty()) {
            reasons.add("Zajedničkih omiljenih događaja: " + commonFavorites.size());
        }
        score += Math.min(75, interestScore);
        if (!conflicts.isEmpty()) {
            int penalty = conflicts.size() * 10;
            score = Math.max(0, score - penalty);
            reasons.add("Suprotna interesovanja: " + String.join(", ", conflicts) + " (-" + penalty + "%)");
        }
        if (reasons.isEmpty()) reasons.add("Još nema dovoljno zajedničkih podataka");
        score = Math.min(100, score);
        return new Match(score, label(score), reasons);
    }

    private Set<Integer> favorites(int userId) {
        Set<Integer> result = new HashSet<>();
        try (Connection conn = DBUtil.open();
             PreparedStatement ps = conn.prepareStatement("SELECT Objava_ID FROM omiljeni_dogadjaji WHERE Korisnik_ID=?")) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) result.add(rs.getInt(1));
            }
        } catch (Exception e) {
            System.out.println(e);
        }
        return result;
    }

    private Set<String> interests(String csv) {
        if (csv == null || csv.isBlank()) return new HashSet<>();
        return Arrays.stream(csv.split(","))
                .map(String::trim).filter(value -> !value.isEmpty())
                .collect(Collectors.toCollection(java.util.LinkedHashSet::new));
    }

    private String normalize(String value) {
        if (value == null) return "";
        String normalized = java.text.Normalizer.normalize(value, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").trim().toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "nogomet", "football", "soccer", "fudbala", "lopta" -> "fudbal";
            case "basket", "basketball", "basketbal", "kosarku", "kosarke" -> "kosarka";
            case "tennis" -> "tenis";
            case "volleyball" -> "odbojka";
            case "handball" -> "rukomet";
            case "trcim", "jogging", "running", "run" -> "trcanje";
            case "gym", "fitness", "fitnes", "vjezbanje", "vezbanje", "workout" -> "teretana";
            case "bicikl", "bajs", "bike", "cycling" -> "biciklizam";
            case "hiking", "hajking" -> "planinarenje";
            case "skiing", "ski" -> "skijanje";
            case "music", "pjesme", "pesme" -> "muzika";
            case "rap", "rap muzika", "rep" -> "rep muzika";
            case "hiphop", "hip-hop" -> "hip hop";
            case "rock", "rock muzika", "rok" -> "rok muzika";
            case "pop muzika" -> "pop";
            case "narodna", "narodna muzika", "folk" -> "folk muzika";
            case "electronic", "edm", "tehno", "techno", "house" -> "elektronska muzika";
            case "jazz", "dzez" -> "dzez";
            case "filmovi", "bioskop" -> "film";
            case "serije" -> "serija";
            case "gaming", "video igrice" -> "video igre";
            case "crvenu zvezdu", "zvezda", "zvezdu", "red star" -> "crvena zvezda";
            case "mancester junajted", "manchester junajted", "mancester united",
                    "manchester united", "man utd", "man united", "mancester utd", "manchester utd" -> "mancester junajted";
            case "mancester siti", "manchester siti", "mancester city", "manchester city",
                    "man city", "man siti" -> "mancester siti";
            case "liverpul" -> "liverpool";
            case "setam" -> "setnja";
            case "putovanje", "putujem" -> "putovanja";
            case "adventure" -> "avantura";
            case "art", "umetnost" -> "umjetnost";
            case "slikanje", "photography" -> "fotografija";
            case "dance", "dancing" -> "ples";
            case "course", "kurs", "seminar" -> "edukacija";
            case "tech", "technology" -> "tehnologija";
            case "coding", "kodiranje", "software", "softver" -> "programiranje";
            case "racunari", "kompjuteri", "computer", "computers" -> "racunari";
            case "ai", "artificial intelligence", "vjestacka inteligencija", "vestacka inteligencija", "umjetna inteligencija" -> "vjestacka inteligencija";
            case "knjiga", "citanje", "reading", "book", "books" -> "knjige";
            case "igre", "games", "igrice", "gejming" -> "video igre";
            case "drustvene igre", "board games", "boardgames" -> "drustvene igre";
            case "koncert" -> "koncerti";
            case "festivali" -> "festival";
            case "nocni zivot", "izlazak", "izlasci", "party", "parti", "zurke" -> "izlasci";
            case "kafic", "cafe" -> "kafic";
            case "restaurant" -> "restoran";
            case "pozoriste", "teatar" -> "pozoriste";
            case "mleko", "milk" -> "mlijeko";
            case "sea", "mora" -> "more";
            case "kupam", "kupati", "plivanje", "plivam", "bazen", "swimming", "pool" -> "kupanje";
            case "plaza", "beach", "beaches" -> "plaza";
            case "kafu", "coffee", "espresso", "espreso" -> "kafa";
            case "caj", "tea" -> "caj";
            case "juice" -> "sok";
            case "water" -> "voda";
            case "beer" -> "pivo";
            case "wine" -> "vino";
            case "brandy" -> "rakija";
            case "food" -> "hrana";
            case "pizza" -> "pica";
            case "rostilj", "bbq", "barbecue" -> "rostilj";
            case "cevapi", "kebapi", "kebab" -> "cevapi";
            case "testenina", "tjestenina" -> "pasta";
            case "hamburger" -> "burger";
            case "sushi", "susi" -> "susi";
            case "ice cream" -> "sladoled";
            case "cokolada", "chocolate" -> "cokolada";
            case "vienna", "wien" -> "bec";
            case "paris" -> "pariz";
            case "belgrade" -> "beograd";
            case "liubliana" -> "ljubljana";
            case "skopje" -> "skoplje";
            case "carigrad" -> "istanbul";
            case "barcelona" -> "barselona";
            case "brussels", "bruxelles" -> "brisel";
            case "lisbon" -> "lisabon";
            case "copenhagen" -> "kopenhagen";
            case "stockholm" -> "stokholm";
            case "zurich", "zürich" -> "cirih";
            case "geneva" -> "zeneva";
            case "rome", "roma" -> "rim";
            case "new york", "nyc" -> "njujork";
            case "munich", "munchen", "muenchen" -> "minhen";
            case "moscow" -> "moskva";
            case "thessaloniki" -> "solun";
            case "athens" -> "atina";
            case "prague", "praha" -> "prag";
            case "warsaw", "warszawa" -> "varsava";
            case "budapest" -> "budimpesta";
            case "venice", "venezia" -> "venecija";
            case "florence", "firenze" -> "firenca";
            case "becici" -> "becici";
            case "montenegro" -> "crna gora";
            case "serbia" -> "srbija";
            case "croatia" -> "hrvatska";
            case "bosna", "bih", "bosnia" -> "bosna i hercegovina";
            case "italy" -> "italija";
            case "spanija", "spain" -> "spanija";
            case "france" -> "francuska";
            case "njemacka", "nemacka", "germany" -> "njemacka";
            case "austria" -> "austrija";
            case "grcka", "greece" -> "grcka";
            default -> normalized;
        };
    }

    private <T> Set<T> intersection(Set<T> first, Set<T> second) {
        Set<T> result = new java.util.LinkedHashSet<>(first);
        result.retainAll(second);
        return result;
    }

    private Set<String> interestGroups(Set<String> values) {
        Set<String> groups = new java.util.LinkedHashSet<>();
        for (String value : values) {
            String normalized = normalize(value);
            if (containsAny(normalized, "sport", "kosarka", "fudbal", "tenis", "odbojka", "rukomet", "trcanje", "teretana")) groups.add("sport");
            if (containsAny(normalized, "muzika", "rep", "hip hop", "rok", "pop", "jazz", "koncert")) groups.add("muzika");
            if (containsAny(normalized, "film", "serija", "pozoriste", "knjiga", "kultura", "umjetnost")) groups.add("kultura");
            if (containsAny(normalized, "priroda", "setnja", "planinarenje", "putovanje", "kampovanje")) groups.add("priroda i putovanja");
            if (containsAny(normalized, "tehnologija", "programiranje", "racunari", "video igre", "gaming")) groups.add("tehnologija");
            if (containsAny(normalized, "edukacija", "ucenje", "nauka", "radionica")) groups.add("edukacija");
        }
        return groups;
    }

    private boolean containsAny(String value, String... terms) {
        return Arrays.stream(terms).anyMatch(value::contains);
    }

    private String groupLabel(String group) {
        return switch (group) {
            case "sport" -> "sport";
            case "muzika" -> "muzika";
            case "kultura" -> "film i kultura";
            case "priroda i putovanja" -> "priroda i putovanja";
            case "tehnologija" -> "tehnologija";
            case "edukacija" -> "edukacija";
            default -> group;
        };
    }

    private <T> Set<T> union(Set<T> first, Set<T> second) {
        Set<T> result = new java.util.LinkedHashSet<>(first);
        result.addAll(second);
        return result;
    }

    private Set<String> intersectionNormalized(Set<String> first, Set<String> second) {
        java.util.Map<String, String> secondNormalized = second.stream()
                .collect(Collectors.toMap(this::normalize, value -> value, (a, b) -> a));
        return first.stream().filter(value -> secondNormalized.containsKey(normalize(value)))
                .collect(Collectors.toCollection(java.util.LinkedHashSet::new));
    }

    private String label(int score) {
        if (score >= 75) return "Odlično poklapanje";
        if (score >= 50) return "Dobro poklapanje";
        if (score >= 25) return "Djelimično poklapanje";
        return "Slabo poklapanje";
    }

    private record Match(int score, String label, List<String> reasons) {}
}
