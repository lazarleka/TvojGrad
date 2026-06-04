package com.example.TvojGrad.controllers;

import com.example.TvojGrad.models.PodjiSaMnomZahtev;
import com.example.TvojGrad.services.PodjiSaMnomZahtevService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping(value = "/zahtevi")
public class PodjiSaMnomZahtevController {

    private final PodjiSaMnomZahtevService zahtevService;
    private final SimpMessagingTemplate messagingTemplate;

    public PodjiSaMnomZahtevController(PodjiSaMnomZahtevService _zahtevService, SimpMessagingTemplate messagingTemplate) {
        this.zahtevService = _zahtevService;
        this.messagingTemplate = messagingTemplate;
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

    @GetMapping(value = "/korisnici/{PosloZahtevID}/{PrimioZahtevID}")
    public ResponseEntity<PodjiSaMnomZahtev> getZahtevByKorisnici(
            @PathVariable("PosloZahtevID") int PosloZahtevID,
            @PathVariable("PrimioZahtevID") int PrimioZahtevID) {
        PodjiSaMnomZahtev z = this.zahtevService.getZahtevByKorisnici(PosloZahtevID, PrimioZahtevID);
        return z != null ? ResponseEntity.ok(z) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<PodjiSaMnomZahtev> kreirajZahtev(@RequestBody PodjiSaMnomZahtev z) {
        PodjiSaMnomZahtev noviZahtev = this.zahtevService.kreirajZahtev(z);
        return noviZahtev != null
                ? ResponseEntity.status(HttpStatus.CREATED).body(noviZahtev)
                : ResponseEntity.badRequest().build();
    }

    @PutMapping(value = "/{ID}")
    public ResponseEntity<PodjiSaMnomZahtev> azurirajZahtev(@PathVariable("ID") int ID, @RequestBody PodjiSaMnomZahtev z) {
        PodjiSaMnomZahtev azuriran = this.zahtevService.azurirajZahtev(ID, z);
        return azuriran != null ? ResponseEntity.ok(azuriran) : ResponseEntity.badRequest().build();
    }

    @PutMapping(value = "/{ID}/status/{Status}")
    public ResponseEntity<PodjiSaMnomZahtev> azurirajStatus(
            @PathVariable("ID") int ID,
            @PathVariable("Status") String Status) {
        PodjiSaMnomZahtev azuriran = this.zahtevService.azurirajStatus(ID, Status);
        if (azuriran != null) {
            posaljiObavjestenjeZaStatus(azuriran);
        }
        return azuriran != null ? ResponseEntity.ok(azuriran) : ResponseEntity.badRequest().build();
    }

    private void posaljiObavjestenjeZaStatus(PodjiSaMnomZahtev zahtev) {
        Integer posiljalacID = zahtev.getPosloZahtev() != null ? zahtev.getPosloZahtev().getID() : null;
        Integer primalacID = zahtev.getPrimioZahtev();

        if (posiljalacID != null) {
            messagingTemplate.convertAndSend("/topic/korisnik/" + posiljalacID + "/zahtevi", zahtev);
        }
        if (primalacID != null && !primalacID.equals(posiljalacID)) {
            messagingTemplate.convertAndSend("/topic/korisnik/" + primalacID + "/zahtevi", zahtev);
        }
    }

    @DeleteMapping(value = "/{ID}")
    public ResponseEntity<Void> obrisiZahtev(@PathVariable("ID") int ID) {
        this.zahtevService.obrisiZahtev(ID);
        return ResponseEntity.noContent().build();
    }
}
