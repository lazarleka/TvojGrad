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
}
