package com.example.TvojGrad.controllers;

import com.example.TvojGrad.models.PodjiSaMnomPrijava;
import com.example.TvojGrad.services.PodjiSaMnomPrijavaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/prijave")
public class PodjiSaMnomPrijavaController {

    private final PodjiSaMnomPrijavaService prijavaService;

    public PodjiSaMnomPrijavaController(PodjiSaMnomPrijavaService _prijavaService) {
        this.prijavaService = _prijavaService;
    }

    @GetMapping
    public ResponseEntity<List<PodjiSaMnomPrijava>> getAllPrijave() {
        return ResponseEntity.ok(this.prijavaService.getAllPrijave());
    }

    @GetMapping(value = "/{ID}")
    public ResponseEntity<PodjiSaMnomPrijava> getPrijavaById(@PathVariable("ID") int ID) {
        PodjiSaMnomPrijava p = this.prijavaService.getPrijavaById(ID);
        return p != null ? ResponseEntity.ok(p) : ResponseEntity.notFound().build();
    }

    // GET /prijave/objava/5 -> Vraca sve prijave za objavu sa ID-em 5
    @GetMapping(value = "/objava/{ObjavaID}")
    public ResponseEntity<List<PodjiSaMnomPrijava>> getPrijaveByObjava(@PathVariable("ObjavaID") int ObjavaID) {
        return ResponseEntity.ok(this.prijavaService.getPrijaveByObjava(ObjavaID));
    }

    @PostMapping
    public ResponseEntity<PodjiSaMnomPrijava> kreirajPrijavu(@RequestBody PodjiSaMnomPrijava p) {
        PodjiSaMnomPrijava novaPrijava = this.prijavaService.kreirajPrijavu(p);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaPrijava);
    }

    @PutMapping(value = "/{ID}")
    public ResponseEntity<PodjiSaMnomPrijava> azurirajPrijavu(@PathVariable("ID") int ID, @RequestBody PodjiSaMnomPrijava p) {
        PodjiSaMnomPrijava azurirana = this.prijavaService.azurirajPrijavu(ID, p);
        return azurirana != null ? ResponseEntity.ok(azurirana) : ResponseEntity.badRequest().build();
    }

    @DeleteMapping(value = "/{ID}")
    public ResponseEntity<Void> obrisiPrijavu(@PathVariable("ID") int ID) {
        this.prijavaService.obrisiPrijavu(ID);
        return ResponseEntity.noContent().build();
    }
}