package com.example.TvojGrad.controllers;

import com.example.TvojGrad.models.Dogadjaj;
import com.example.TvojGrad.services.OmiljeniDogadjajService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/OmiljeniDogadjaji")
public class OmiljeniDogadjajiController {

    private OmiljeniDogadjajService omiljeniDogadjajService = null;

    public OmiljeniDogadjajiController(OmiljeniDogadjajService _omiljeniDogadjajService) {
        this.omiljeniDogadjajService = _omiljeniDogadjajService;
    }

    @GetMapping(value = "/{KorisnikID}")
    public List<Dogadjaj> getAllOmiljeniDogadjaj(@PathVariable("KorisnikID") int KorisnikID) {
        return this.omiljeniDogadjajService.getAllOmiljeniDogadjaj(KorisnikID);
    }

    @PostMapping(value = "/{KorisnikID}/{DogadjajID}")
    public void dodajOmiljeniDogadjaj(
            @PathVariable("KorisnikID") int KorisnikID,
            @PathVariable("DogadjajID") int DogadjajID) {
        this.omiljeniDogadjajService.dodajOmiljeniDogadjaj(KorisnikID, DogadjajID);
    }

    @DeleteMapping(value = "/{KorisnikID}/{DogadjajID}")
    public void izbrisiOmiljeniDogadjaj(
            @PathVariable("KorisnikID") int KorisnikID,
            @PathVariable("DogadjajID") int DogadjajID) {
        this.omiljeniDogadjajService.izbrisiOmiljeniDogadjaj(KorisnikID, DogadjajID);
    }
}