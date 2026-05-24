package com.example.TvojGrad.services;

import com.example.TvojGrad.controllers.OmiljeniDogadjajiController;
import com.example.TvojGrad.models.Dogadjaj;
import org.springframework.stereotype.Service;

import java.util.List;

@Service

public class OmiljeniDogadjajService {

    private OmiljeniDogadjajRepositories omiljeniDogadjajRepositories = null;


    public OmiljeniDogadjajService (OmiljeniDogadjajRepositories _omiljenidogadjajreposories){
        this.omiljeniDogadjajRepositories=_omiljenidogadjajreposories;

    }


    public List<Dogadjaj> GetAllOmiljeniDOgadjaj(int KorisnikID){
        return this.omiljeniDogadjajRepositories.GetAllOmiljeniDogadjaj(KorisnikID);

    }

    public void DodajOmiljeniDogadjaj(int KorisnikID,int DogadjajID){
        this.omiljeniDogadjajRepositories.DodajOmiljeniDogadjaj(DogadjajID);
    }

    public void IzbrisiOmiljeniDogadjaj(int KorisnikID,int DogadjajID){
        this.omiljeniDogadjajRepositories.ObrisiOmiljeniDogadjaj(DogadjajID);
    }

}
