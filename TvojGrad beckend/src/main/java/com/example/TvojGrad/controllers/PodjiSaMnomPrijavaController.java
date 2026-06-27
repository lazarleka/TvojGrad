package com.example.TvojGrad.controllers;

import com.example.TvojGrad.models.PodjiSaMnomPrijava;
import com.example.TvojGrad.services.PodjiSaMnomPrijavaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping(value = "/prijave")
public class PodjiSaMnomPrijavaController {

    private final PodjiSaMnomPrijavaService prijavaService;
    private final com.example.TvojGrad.services.MatchingService matchingService;

    public PodjiSaMnomPrijavaController(PodjiSaMnomPrijavaService _prijavaService, com.example.TvojGrad.services.MatchingService matchingService) {
        this.prijavaService = _prijavaService;
        this.matchingService = matchingService;
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
    public ResponseEntity<List<PodjiSaMnomPrijava>> getPrijaveByObjava(
            @PathVariable("ObjavaID") int ObjavaID,
            @RequestParam(value = "korisnikId", required = false) Integer korisnikId) {
        List<PodjiSaMnomPrijava> prijave = this.prijavaService.getPrijaveByObjava(ObjavaID);
        return ResponseEntity.ok(this.matchingService.dodajPodudaranja(prijave, korisnikId));
    }

    @PostMapping
    public ResponseEntity<PodjiSaMnomPrijava> kreirajPrijavu(@RequestBody PodjiSaMnomPrijava p) {
        PodjiSaMnomPrijava novaPrijava = this.prijavaService.kreirajPrijavu(p);
        return novaPrijava != null
                ? ResponseEntity.status(HttpStatus.CREATED).body(novaPrijava)
                : ResponseEntity.badRequest().build();
    }

    @PostMapping(value = "/{KorisnikID}/{ObjavaID}")
    public ResponseEntity<PodjiSaMnomPrijava> kreirajPrijavuZaKorisnika(
            @PathVariable("KorisnikID") int KorisnikID,
            @PathVariable("ObjavaID") int ObjavaID,
            @RequestBody PodjiSaMnomPrijava p) {
        PodjiSaMnomPrijava novaPrijava = this.prijavaService.kreirajPrijavu(
                p.getTekst(),
                p.getStatus(),
                KorisnikID,
                ObjavaID
        );
        return novaPrijava != null
                ? ResponseEntity.status(HttpStatus.CREATED).body(novaPrijava)
                : ResponseEntity.badRequest().build();
    }

    @PutMapping(value = "/{ID}")
    public ResponseEntity<PodjiSaMnomPrijava> azurirajPrijavu(@PathVariable("ID") int ID, @RequestBody PodjiSaMnomPrijava p) {
        PodjiSaMnomPrijava azurirana = this.prijavaService.azurirajPrijavu(ID, p);
        return azurirana != null ? ResponseEntity.ok(azurirana) : ResponseEntity.badRequest().build();
    }

    @PutMapping(value = "/{ID}/status/{Status}")
    public ResponseEntity<PodjiSaMnomPrijava> azurirajStatus(
            @PathVariable("ID") int ID,
            @PathVariable("Status") String Status) {
        PodjiSaMnomPrijava azurirana = this.prijavaService.azurirajStatus(ID, Status);
        return azurirana != null ? ResponseEntity.ok(azurirana) : ResponseEntity.badRequest().build();
    }

    @DeleteMapping(value = "/{ID}")
    public ResponseEntity<Void> obrisiPrijavu(@PathVariable("ID") int ID) {
        return this.prijavaService.obrisiPrijavu(ID)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
