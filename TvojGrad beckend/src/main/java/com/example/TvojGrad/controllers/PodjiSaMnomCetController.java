package com.example.TvojGrad.controllers;

import com.example.TvojGrad.models.PodjiSaMnomCet;
import com.example.TvojGrad.services.PodjiSaMnomCetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
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

    @PostMapping
    public ResponseEntity<PodjiSaMnomCet> kreirajCet(@RequestBody PodjiSaMnomCet c) {
        PodjiSaMnomCet noviCet = this.cetService.kreirajCet(c);
        return ResponseEntity.status(HttpStatus.CREATED).body(noviCet);
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