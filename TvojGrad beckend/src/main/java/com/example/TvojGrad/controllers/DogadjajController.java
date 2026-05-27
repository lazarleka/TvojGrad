package com.example.TvojGrad.controllers;

import com.example.TvojGrad.models.Dogadjaj;
import com.example.TvojGrad.services.DogadjajService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
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

    // PUT /dogadjaji/{ID}/upvote
    @PutMapping(value = "/{DogadjajID}/upvote")
    public Dogadjaj upvote(@PathVariable("DogadjajID") int DogadjajID) {
        return this.dogadjajService.upvote(DogadjajID);
    }

    // PUT /dogadjaji/{ID}/downvote
    @PutMapping(value = "/{DogadjajID}/downvote")
    public Dogadjaj downvote(@PathVariable("DogadjajID") int DogadjajID) {
        return this.dogadjajService.downvote(DogadjajID);
    }
    @PutMapping(value = "/{DogadjajID}/removeupvote")
    public Dogadjaj removeUpvote(@PathVariable("DogadjajID") int DogadjajID) {
        return this.dogadjajService.removeUpvote(DogadjajID);
    }

    @PutMapping(value = "/{DogadjajID}/removedownvote")
    public Dogadjaj removeDownvote(@PathVariable("DogadjajID") int DogadjajID) {
        return this.dogadjajService.removeDownvote(DogadjajID);
    }
}