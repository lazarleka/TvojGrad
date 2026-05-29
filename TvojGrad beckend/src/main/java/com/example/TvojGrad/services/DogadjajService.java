package com.example.TvojGrad.services;

import com.example.TvojGrad.models.Dogadjaj;
import com.example.TvojGrad.repositories.DogadjajRepositories;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DogadjajService {

    private DogadjajRepositories dogadjajRepositories = null;

    public DogadjajService(DogadjajRepositories _dogadjajRepositories) {
        this.dogadjajRepositories = _dogadjajRepositories;
    }

    public List<Dogadjaj> getAllDogadjaji() {
        return this.dogadjajRepositories.getAllDogadjaji();
    }

    public List<Dogadjaj> getSviDogadjajiZaAdmin() {
        return this.dogadjajRepositories.getSviDogadjajiZaAdmin();
    }

    public List<Dogadjaj> getDogadjajiByOrganizator(int organizatorID) {
        return this.dogadjajRepositories.getDogadjajiByOrganizator(organizatorID);
    }

    public Dogadjaj getDogadjajById(int ID) {
        return this.dogadjajRepositories.getDogadjajById(ID);
    }

    public Dogadjaj kreirajDogadjaj(Dogadjaj d) {
        return this.dogadjajRepositories.kreirajDogadjaj(d);
    }

    public Dogadjaj AzuritanjeDogadjaja(int ID, Dogadjaj d) {
        return this.dogadjajRepositories.azurirajDogadjaj(ID, d);
    }

    public void ObrisiDogadjaja(int ID) {
        this.dogadjajRepositories.ObrisiDogadjaj(ID);
    }

    public Dogadjaj upvote(int ID) {
        return this.dogadjajRepositories.upvote(ID);
    }

    public Dogadjaj downvote(int ID) {
        return this.dogadjajRepositories.downvote(ID);
    }
    public Dogadjaj removeUpvote(int ID) {
        return this.dogadjajRepositories.removeUpvote(ID);
    }

    public Dogadjaj removeDownvote(int ID) {
        return this.dogadjajRepositories.removeDownvote(ID);
    }

    public Dogadjaj upvote(int dogadjajID, int korisnikID) {
        return this.dogadjajRepositories.glasaj(dogadjajID, korisnikID, "up");
    }

    public Dogadjaj downvote(int dogadjajID, int korisnikID) {
        return this.dogadjajRepositories.glasaj(dogadjajID, korisnikID, "down");
    }

    public Dogadjaj ukloniGlas(int dogadjajID, int korisnikID) {
        return this.dogadjajRepositories.ukloniGlas(dogadjajID, korisnikID);
    }

    public String getGlas(int dogadjajID, int korisnikID) {
        return this.dogadjajRepositories.getGlas(dogadjajID, korisnikID);
    }

    public Dogadjaj odobriDogadjaj(int ID, Integer administratorID) {
        Dogadjaj dogadjaj = this.dogadjajRepositories.getDogadjajById(ID);
        String status = "na_cekanju_promovisana".equals(dogadjaj.getStatus()) ? "promovisana" : "odobrena";
        return this.dogadjajRepositories.promijeniStatus(ID, status, administratorID);
    }

    public Dogadjaj odbijDogadjaj(int ID, Integer administratorID) {
        return this.dogadjajRepositories.promijeniStatus(ID, "odbijena", administratorID);
    }

    public Dogadjaj zahtjevZaPromociju(int ID) {
        return this.dogadjajRepositories.zahtjevZaPromociju(ID);
    }

    public Dogadjaj azurirajSliku(int ID, String slika) {
        return this.dogadjajRepositories.azurirajSliku(ID, slika);
    }
}
