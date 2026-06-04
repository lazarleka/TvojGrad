package com.example.TvojGrad.services;

import com.example.TvojGrad.models.PodjiSaMnomZahtev;
import com.example.TvojGrad.repositories.PodjiSaMnomZahtevRepositories;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PodjiSaMnomZahtevService {

    private final PodjiSaMnomZahtevRepositories zahtevRepositories;

    public PodjiSaMnomZahtevService(PodjiSaMnomZahtevRepositories _zahtevRepositories) {
        this.zahtevRepositories = _zahtevRepositories;
    }

    public List<PodjiSaMnomZahtev> getAllZahtevi() { return this.zahtevRepositories.getAllZahtevi(); }
    public PodjiSaMnomZahtev getZahtevById(int ID) { return this.zahtevRepositories.getZahtevById(ID); }
    public PodjiSaMnomZahtev getZahtevByKorisnici(int posloZahtevID, int primioZahtevID) {
        return this.zahtevRepositories.getZahtevByKorisnici(posloZahtevID, primioZahtevID);
    }
    public PodjiSaMnomZahtev kreirajZahtev(PodjiSaMnomZahtev z) { return this.zahtevRepositories.kreirajZahtev(z); }
    public PodjiSaMnomZahtev azurirajZahtev(int ID, PodjiSaMnomZahtev z) { return this.zahtevRepositories.azurirajZahtev(ID, z); }
    public PodjiSaMnomZahtev azurirajStatus(int ID, String status) { return this.zahtevRepositories.azurirajStatus(ID, status); }
    public void obrisiZahtev(int ID) { this.zahtevRepositories.obrisiZahtev(ID); }
    public boolean obrisiPoslatiZahtevNaCekanju(int ID, int korisnikID) {
        PodjiSaMnomZahtev zahtev = this.zahtevRepositories.getZahtevById(ID);
        if (zahtev == null || zahtev.getPosloZahtev() == null || zahtev.getPosloZahtev().getID() == null) {
            return false;
        }
        String status = zahtev.getStatus() != null ? zahtev.getStatus().toLowerCase() : "";
        boolean naCekanju = !status.contains("prihv") && !status.contains("odbij");
        if (!zahtev.getPosloZahtev().getID().equals(korisnikID) || !naCekanju) {
            return false;
        }
        this.zahtevRepositories.obrisiZahtev(ID);
        return true;
    }
}
