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
}