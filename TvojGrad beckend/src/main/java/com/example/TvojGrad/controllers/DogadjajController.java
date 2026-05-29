package com.example.TvojGrad.controllers;

import com.example.TvojGrad.models.Dogadjaj;
import com.example.TvojGrad.models.VoteRequest;
import com.example.TvojGrad.services.DogadjajService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    @GetMapping(value = "/admin/svi")
    public List<Dogadjaj> getSviDogadjajiZaAdmin() {
        return this.dogadjajService.getSviDogadjajiZaAdmin();
    }

    @GetMapping(value = "/organizator/{OrganizatorID}")
    public List<Dogadjaj> getDogadjajiByOrganizator(@PathVariable("OrganizatorID") int OrganizatorID) {
        return this.dogadjajService.getDogadjajiByOrganizator(OrganizatorID);
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

    @PutMapping(value = "/{DogadjajID}/odobri")
    public Dogadjaj odobriDogadjaj(
            @PathVariable("DogadjajID") int DogadjajID,
            @RequestParam(value = "administratorID", required = false) Integer administratorID) {
        return this.dogadjajService.odobriDogadjaj(DogadjajID, administratorID);
    }

    @PutMapping(value = "/{DogadjajID}/odbij")
    public Dogadjaj odbijDogadjaj(
            @PathVariable("DogadjajID") int DogadjajID,
            @RequestParam(value = "administratorID", required = false) Integer administratorID) {
        return this.dogadjajService.odbijDogadjaj(DogadjajID, administratorID);
    }

    @PutMapping(value = "/{DogadjajID}/zahtjev-promocija")
    public Dogadjaj zahtjevZaPromociju(@PathVariable("DogadjajID") int DogadjajID) {
        return this.dogadjajService.zahtjevZaPromociju(DogadjajID);
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

    @PutMapping(value = "/{DogadjajID}/upvote/{KorisnikID}")
    public Dogadjaj upvoteKorisnika(
            @PathVariable("DogadjajID") int DogadjajID,
            @PathVariable("KorisnikID") int KorisnikID) {
        return this.dogadjajService.upvote(DogadjajID, KorisnikID);
    }

    @PutMapping(value = "/{DogadjajID}/downvote/{KorisnikID}")
    public Dogadjaj downvoteKorisnika(
            @PathVariable("DogadjajID") int DogadjajID,
            @PathVariable("KorisnikID") int KorisnikID) {
        return this.dogadjajService.downvote(DogadjajID, KorisnikID);
    }

    @PostMapping(value = "/{DogadjajID}/upvote")
    public Dogadjaj upvoteKorisnikaBody(
            @PathVariable("DogadjajID") int DogadjajID,
            @RequestBody VoteRequest voteRequest) {
        return this.dogadjajService.upvote(DogadjajID, voteRequest.getKorisnikID());
    }

    @PostMapping(value = "/{DogadjajID}/downvote")
    public Dogadjaj downvoteKorisnikaBody(
            @PathVariable("DogadjajID") int DogadjajID,
            @RequestBody VoteRequest voteRequest) {
        return this.dogadjajService.downvote(DogadjajID, voteRequest.getKorisnikID());
    }

    @DeleteMapping(value = "/{DogadjajID}/vote/{KorisnikID}")
    public Dogadjaj ukloniGlas(
            @PathVariable("DogadjajID") int DogadjajID,
            @PathVariable("KorisnikID") int KorisnikID) {
        return this.dogadjajService.ukloniGlas(DogadjajID, KorisnikID);
    }

    @GetMapping(value = "/{DogadjajID}/vote/{KorisnikID}")
    public Map<String, String> getGlas(
            @PathVariable("DogadjajID") int DogadjajID,
            @PathVariable("KorisnikID") int KorisnikID) {
        Map<String, String> response = new HashMap<>();
        response.put("vote", this.dogadjajService.getGlas(DogadjajID, KorisnikID));
        return response;
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
