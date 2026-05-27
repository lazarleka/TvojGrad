package com.example.TvojGrad.controllers;

import com.example.TvojGrad.models.PodjiSaMnomCet;
import com.example.TvojGrad.services.PodjiSaMnomCetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping(value = "/cetovi")
public class PodjiSaMnomCetController {

    private final PodjiSaMnomCetService cetService;

    public PodjiSaMnomCetController(PodjiSaMnomCetService _cetService) {
        this.cetService = _cetService;
    }

    @GetMapping
    public ResponseEntity<List<PodjiSaMnomCet>> getAllCetovi() {
        return ResponseEntity.ok(this.cetService.getAllCetovi());
    }

    @GetMapping(value = "/{ID}")
    public ResponseEntity<PodjiSaMnomCet> getCetById(@PathVariable("ID") int ID) {
        PodjiSaMnomCet c = this.cetService.getCetById(ID);
        return c != null ? ResponseEntity.ok(c) : ResponseEntity.notFound().build();
    }

    @GetMapping(value = "/korisnik/{KorisnikID}")
    public ResponseEntity<List<PodjiSaMnomCet>> getCetoviByKorisnik(@PathVariable("KorisnikID") int KorisnikID) {
        return ResponseEntity.ok(this.cetService.getCetoviByKorisnik(KorisnikID));
    }

    @GetMapping(value = "/prijava/{PrijavaID}/{PosiljalacID}/{PrimalacID}")
    public ResponseEntity<PodjiSaMnomCet> getCetByPrijavaIKorisnici(
            @PathVariable("PrijavaID") int PrijavaID,
            @PathVariable("PosiljalacID") int PosiljalacID,
            @PathVariable("PrimalacID") int PrimalacID) {
        PodjiSaMnomCet c = this.cetService.getCetByPrijavaIKorisnici(PrijavaID, PosiljalacID, PrimalacID);
        return c != null ? ResponseEntity.ok(c) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<PodjiSaMnomCet> kreirajCet(@RequestBody PodjiSaMnomCet c) {
        PodjiSaMnomCet noviCet = this.cetService.kreirajCet(c);
        return noviCet != null ? ResponseEntity.status(HttpStatus.CREATED).body(noviCet) : ResponseEntity.badRequest().build();
    }

    @PutMapping(value = "/{ID}")
    public ResponseEntity<PodjiSaMnomCet> azurirajCet(@PathVariable("ID") int ID, @RequestBody PodjiSaMnomCet c) {
        PodjiSaMnomCet azuriran = this.cetService.azurirajCet(ID, c);
        return azuriran != null ? ResponseEntity.ok(azuriran) : ResponseEntity.badRequest().build();
    }

    @DeleteMapping(value = "/{ID}")
    public ResponseEntity<Void> obrisiCet(@PathVariable("ID") int ID) {
        this.cetService.obrisiCet(ID);
        return ResponseEntity.noContent().build();
    }
}
