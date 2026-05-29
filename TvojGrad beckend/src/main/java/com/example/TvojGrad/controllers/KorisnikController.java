package com.example.TvojGrad.controllers;

import com.example.TvojGrad.models.Korisnik;
import com.example.TvojGrad.services.KorisnikService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
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

    @GetMapping(value = "/admin-zahtjevi")
    public List<Korisnik> getAdminZahtjevi() {
        return this.korisnikService.getAdminZahtjevi();
    }

    @GetMapping(value = "/organizator-zahtjevi")
    public List<Korisnik> getOrganizatorZahtjevi() {
        return this.korisnikService.getOrganizatorZahtjevi();
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

    @PutMapping(value = "/{ID}/odobri-admin")
    public Korisnik odobriAdmina(@PathVariable("ID") int ID) {
        return this.korisnikService.odobriAdmina(ID);
    }

    @PutMapping(value = "/{ID}/odbij-admin")
    public Korisnik odbijAdmina(@PathVariable("ID") int ID) {
        return this.korisnikService.odbijAdmina(ID);
    }

    @PutMapping(value = "/{ID}/odobri-organizatora")
    public Korisnik odobriOrganizatora(@PathVariable("ID") int ID) {
        return this.korisnikService.odobriOrganizatora(ID);
    }

    @PutMapping(value = "/{ID}/odbij-organizatora")
    public Korisnik odbijOrganizatora(@PathVariable("ID") int ID) {
        return this.korisnikService.odbijOrganizatora(ID);
    }

    @DeleteMapping(value = "/{ID}")
    public void obrisiKorisnika(@PathVariable("ID") int ID) {
        this.korisnikService.obrisiKorisnika(ID);
    }
}
