package com.example.TvojGrad.services;

import com.example.TvojGrad.models.Korisnik;
import com.example.TvojGrad.repositories.KorisnikRepositories;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class KorisnikService {

    private KorisnikRepositories korisnikRepositories = null;

    public KorisnikService(KorisnikRepositories _korisnikRepositories) {
        this.korisnikRepositories = _korisnikRepositories;
    }

    public List<Korisnik> getAllKorisnici() {
        return this.korisnikRepositories.getAllKorisnici();
    }

    public Korisnik getKorisnikById(int ID) {
        return this.korisnikRepositories.getKorisnikById(ID);
    }

    public Korisnik kreirajKorisnika(Korisnik k) {
        return this.korisnikRepositories.kreirajKorisnika(k);
    }

    public Korisnik azurirajKorisnika(int ID, Korisnik k) {
        return this.korisnikRepositories.azurirajKorisnika(ID, k);
    }

    public void obrisiKorisnika(int ID) {
        this.korisnikRepositories.obrisiKorisnika(ID);
    }
}