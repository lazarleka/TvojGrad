package com.example.TvojGrad.controllers;

import com.example.TvojGrad.models.PodjiSaMnomZahtev;
import com.example.TvojGrad.services.PodjiSaMnomZahtevService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/zahtevi")
public class PodjiSaMnomZahtevController {

    private final PodjiSaMnomZahtevService zahtevService;

    public PodjiSaMnomZahtevController(PodjiSaMnomZahtevService _zahtevService) {
        this.zahtevService = _zahtevService;
    }

    @GetMapping
    public ResponseEntity<List<PodjiSaMnomZahtev>> getAllZahtevi() {
        return ResponseEntity.ok(this.zahtevService.getAllZahtevi());
    }

    @GetMapping(value = "/{ID}")
    public ResponseEntity<PodjiSaMnomZahtev> getZahtevById(@PathVariable("ID") int ID) {
        PodjiSaMnomZahtev z = this.zahtevService.getZahtevById(ID);
        return z != null ? ResponseEntity.ok(z) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<PodjiSaMnomZahtev> kreirajZahtev(@RequestBody PodjiSaMnomZahtev z) {
        PodjiSaMnomZahtev noviZahtev = this.zahtevService.kreirajZahtev(z);
        return ResponseEntity.status(HttpStatus.CREATED).body(noviZahtev);
    }

    @PutMapping(value = "/{ID}")
    public ResponseEntity<PodjiSaMnomZahtev> azurirajZahtev(@PathVariable("ID") int ID, @RequestBody PodjiSaMnomZahtev z) {
        PodjiSaMnomZahtev azuriran = this.zahtevService.azurirajZahtev(ID, z);
        return azuriran != null ? ResponseEntity.ok(azuriran) : ResponseEntity.badRequest().build();
    }

    @DeleteMapping(value = "/{ID}")
    public ResponseEntity<Void> obrisiZahtev(@PathVariable("ID") int ID) {
        this.zahtevService.obrisiZahtev(ID);
        return ResponseEntity.noContent().build();
    }
}