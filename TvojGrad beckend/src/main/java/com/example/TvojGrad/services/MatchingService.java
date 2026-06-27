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
            score += 15;
            reasons.add("Isti grad: " + candidate.getGrad());
        }

        Set<String> viewerInterests = interests(viewer.getInteresovanja());
        Set<String> candidateInterests = interests(candidate.getInteresovanja());
        Set<String> commonInterests = intersectionNormalized(viewerInterests, candidateInterests);
        Set<String> allInterests = union(viewerInterests, candidateInterests);
        long distinctInterestCount = allInterests.stream().map(this::normalize).distinct().count();
        if (distinctInterestCount > 0) {
            score += (int) Math.round(55.0 * commonInterests.size() / distinctInterestCount);
        }
        if (!commonInterests.isEmpty()) {
            reasons.add("Zajednička interesovanja: " + String.join(", ", commonInterests));
        }

        Set<String> conflicts = union(
                intersectionNormalized(viewerInterests, interests(candidate.getNeinteresovanja())),
                intersectionNormalized(candidateInterests, interests(viewer.getNeinteresovanja())));
        Set<Integer> commonFavorites = intersection(viewerFavorites, candidateFavorites);
        Set<Integer> allFavorites = union(viewerFavorites, candidateFavorites);
        if (!allFavorites.isEmpty()) {
            score += (int) Math.round(30.0 * commonFavorites.size() / allFavorites.size());
        }
        if (!commonFavorites.isEmpty()) {
            reasons.add("Zajedničkih omiljenih događaja: " + commonFavorites.size());
        }
        if (!conflicts.isEmpty()) {
            int penalty = conflicts.size() * 15;
            score = Math.max(0, score - penalty);
            reasons.add("Suprotna interesovanja: " + String.join(", ", conflicts) + " (-" + penalty + "%)");
        }
        if (reasons.isEmpty()) reasons.add("Još nema dovoljno zajedničkih podataka");
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
            case "nogomet", "football", "soccer" -> "fudbal";
            case "basket", "basketball" -> "kosarka";
            case "rock", "rock muzika", "rok" -> "rok muzika";
            case "filmovi" -> "film";
            case "serije" -> "serija";
            case "gaming", "video igrice" -> "video igre";
            default -> normalized;
        };
    }

    private <T> Set<T> intersection(Set<T> first, Set<T> second) {
        Set<T> result = new java.util.LinkedHashSet<>(first);
        result.retainAll(second);
        return result;
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
