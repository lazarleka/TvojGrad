package com.example.TvojGrad.services;

import com.example.TvojGrad.models.Dogadjaj;
import com.example.TvojGrad.repositories.OmiljeniDogadjajRepositories;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OmiljeniDogadjajService {

    private OmiljeniDogadjajRepositories omiljeniDogadjajRepositories = null;

    public OmiljeniDogadjajService(OmiljeniDogadjajRepositories _omiljeniDogadjajRepositories) {
        this.omiljeniDogadjajRepositories = _omiljeniDogadjajRepositories;
    }

    public List<Dogadjaj> getAllOmiljeniDogadjaj(int KorisnikID) {
        return this.omiljeniDogadjajRepositories.GetAllOmiljeniDogadjaj(KorisnikID);
    }

    public void dodajOmiljeniDogadjaj(int KorisnikID, int DogadjajID) {
        this.omiljeniDogadjajRepositories.DodajOmiljeniDogadjaj(KorisnikID, DogadjajID);
    }

    public void izbrisiOmiljeniDogadjaj(int KorisnikID, int DogadjajID) {
        this.omiljeniDogadjajRepositories.ObrisiOmiljeniDogadjaj(KorisnikID, DogadjajID);
    }
}