package com.example.TvojGrad.controllers;

import com.example.TvojGrad.models.Dogadjaj;
import com.example.TvojGrad.services.DogadjajService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/dogadjaji")
public class DogadjajController {

    private DogadjajService dogadjajService = null;

    public DogadjajController(DogadjajService _dogadjajService) {
        this.dogadjajService = _dogadjajService;
    }

    @GetMapping
    public List<Dogadjaj> getAllDogadjaji() {
        return this.dogadjajService.getAllDogadjaji();
    }

    @GetMapping(value = "/{DogadjajID}")
    public Dogadjaj getDogadjajByID(@PathVariable("DogadjajID") int DogadjajID) {
        return this.dogadjajService.getDogadjajById(DogadjajID);
    }

    @PostMapping
    public Dogadjaj kreirajDogadjaj(@RequestBody Dogadjaj dogadjaj) {
        return this.dogadjajService.kreirajDogadjaj(dogadjaj);
    }

    @PutMapping(value = "/{DogadjajID}")
    public Dogadjaj azurirajDogadjaj(@PathVariable("DogadjajID") int DogadjajID, @RequestBody Dogadjaj dogadjaj) {
        return this.dogadjajService.AzuritanjeDogadjaja(DogadjajID, dogadjaj);
    }

    @DeleteMapping(value = "/{DogadjajID}")
    public void obrisiDogadjaj(@PathVariable("DogadjajID") int DogadjajID) {
        this.dogadjajService.ObrisiDogadjaja(DogadjajID);
    }
}