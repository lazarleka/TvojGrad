
package com.example.TvojGrad.services;

import com.example.TvojGrad.models.PodjiSaMnomCet;
import com.example.TvojGrad.repositories.PodjiSaMnomCetRepositories;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PodjiSaMnomCetService {

    private final PodjiSaMnomCetRepositories cetRepositories;

    public PodjiSaMnomCetService(PodjiSaMnomCetRepositories _cetRepositories) {
        this.cetRepositories = _cetRepositories;
    }

    public List<PodjiSaMnomCet> getAllCetovi() { return this.cetRepositories.getAllCetovi(); }
    public PodjiSaMnomCet getCetById(int ID) { return this.cetRepositories.getCetById(ID); }
    public List<PodjiSaMnomCet> getCetoviByKorisnik(int korisnikID) { return this.cetRepositories.getCetoviByKorisnik(korisnikID); }
    public PodjiSaMnomCet getCetByPrijavaIKorisnici(int prijavaID, int posiljalacID, int primalacID) {
        return this.cetRepositories.getCetByPrijavaIKorisnici(prijavaID, posiljalacID, primalacID);
    }
    public PodjiSaMnomCet kreirajCet(PodjiSaMnomCet c) { return this.cetRepositories.kreirajCet(c); }
    public PodjiSaMnomCet azurirajCet(int ID, PodjiSaMnomCet c) { return this.cetRepositories.azurirajCet(ID, c); }
    public void obrisiCet(int ID) { this.cetRepositories.obrisiCet(ID); }
}
