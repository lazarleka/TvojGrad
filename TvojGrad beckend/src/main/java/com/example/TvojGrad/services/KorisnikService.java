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

    public List<Korisnik> getAdminZahtjevi() {
        return this.korisnikRepositories.getAdminZahtjevi();
    }

    public List<Korisnik> getOrganizatorZahtjevi() {
        return this.korisnikRepositories.getOrganizatorZahtjevi();
    }

    public Korisnik odobriAdmina(int ID) {
        return this.korisnikRepositories.azurirajOrganizatorStatus(ID, "aktivan");
    }

    public Korisnik odbijAdmina(int ID) {
        return this.korisnikRepositories.arhivirajOrganizatora(ID);
    }

    public Korisnik odobriOrganizatora(int ID) {
        return this.korisnikRepositories.azurirajOrganizatorStatus(ID, "aktivan");
    }

    public Korisnik odbijOrganizatora(int ID) {
        return this.korisnikRepositories.arhivirajOrganizatora(ID);
    }

    public Korisnik arhivirajOrganizatora(int ID) {
        return this.korisnikRepositories.arhivirajOrganizatora(ID);
    }

    public Korisnik vratiOrganizatora(int ID) {
        return this.korisnikRepositories.vratiOrganizatora(ID);
    }

    public Korisnik azurirajProfilnu(int ID, String profilna) {
        return this.korisnikRepositories.azurirajProfilnu(ID, profilna);
    }
}
