package com.example.TvojGrad.services;

import com.example.TvojGrad.models.Dogadjaj;
import com.example.TvojGrad.repositories.DogadjajRepositories;
import org.springframework.stereotype.Service;
import  java.util.List;

@Service
public class DogadjajService {

    private DogadjajRepositories dogadjajRepositories=null;

    public DogadjajService(DogadjajRepositories _dogadjajrepositories){
        this.dogadjajRepositories=_dogadjajrepositories;
    }


    public List<Dogadjaj> getAllDogadjaji(){
        List<Dogadjaj> result=this.dogadjajRepositories.getAllDogadjaji();
        return  result;

    }

    public Dogadjaj getDogadjajById(int ID){
        Dogadjaj d=this.dogadjajRepositories.getDogadjajById(ID);
        return d;


    }
    public Dogadjaj kreirajDogadjaj(Dogadjaj d){
         return this.dogadjajRepositories.kreirajDogadjaj(d);

    }

    public Dogadjaj AzuritanjeDogadjaja(int ID,Dogadjaj d){
            return  this.dogadjajRepositories.azurirajDogadjaj(ID,d);

    }
    public void ObrisiDogadjaja(int ID){
        this.dogadjajRepositories.ObrisiDogadjaj(ID);

    }









}
