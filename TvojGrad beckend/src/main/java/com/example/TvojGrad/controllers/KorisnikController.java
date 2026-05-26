package com.example.TvojGrad.controllers;

import com.example.TvojGrad.models.Korisnik;
import com.example.TvojGrad.services.KorisnikService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/korisnici")
public class KorisnikController {

    private KorisnikService korisnikService = null;

    public KorisnikController(KorisnikService _korisnikService) {
        this.korisnikService = _korisnikService;
    }

    @GetMapping
    public List<Korisnik> getAllKorisnici() {
        return this.korisnikService.getAllKorisnici();
    }

    @GetMapping(value = "/{ID}")
    public Korisnik getKorisnikById(@PathVariable("ID") int ID) {
        return this.korisnikService.getKorisnikById(ID);
    }

    @PostMapping
    public Korisnik kreirajKorisnika(@RequestBody Korisnik k) {
        return this.korisnikService.kreirajKorisnika(k);
    }

    @PutMapping(value = "/{ID}")
    public Korisnik azurirajKorisnika(@PathVariable("ID") int ID, @RequestBody Korisnik k) {
        return this.korisnikService.azurirajKorisnika(ID, k);
    }

    @DeleteMapping(value = "/{ID}")
    public void obrisiKorisnika(@PathVariable("ID") int ID) {
        this.korisnikService.obrisiKorisnika(ID);
    }
}