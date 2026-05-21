package com.example.TvojGrad.controllers;

import com.example.TvojGrad.models.Dogadjaj;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/OmiljeniDogadjaji")

public class OmiljeniDogadjajiController {

    private OmiljeniDogadjajiService  omiljeniDogadjajiService=null;

    public OmiljeniDogadjajiController(OmiljeniDogadjajiService _omiljeniDogadjajService){
        this.omiljeniDogadjajiService=_omiljeniDogadjajService;

    }


    @GetMapping
    public List<Dogadjaj> GetAllOmiljeniDOgadjaj(int KorisnikID){
        return this.omiljeniDogadjajiService.getAllOmiljeniDogadjaj(KorisnikID);

    }


    @PostMapping(value="/{DogadjajID}")
    public void DodajOmiljeniDogadjaj(@PathVariable("DogadjajID") int KorisnikID, int DogadjajID){

        this.omiljeniDogadjajiService.dodajOmiljeniDogadjaj(DogadjajID);

    }

    @DeleteMapping(value = "/{DogadjajID}")
    public void IzbrisiOmiljeniDogadjaj(@PathVariable("DogadjajID") int KorisnikID,int DogadjajID){
        this.omiljeniDogadjajiService.izbrisiOmiljeniDogadjaj(DogadjajID);
    }



}
