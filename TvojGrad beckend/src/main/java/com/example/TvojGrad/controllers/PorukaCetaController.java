package com.example.TvojGrad.controllers;

import com.example.TvojGrad.models.PorukaCeta;
import com.example.TvojGrad.repositories.PorukaCetaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping(value = "/poruke-ceta")
public class PorukaCetaController {

    private final PorukaCetaRepository porukaRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public PorukaCetaController(PorukaCetaRepository porukaRepository, SimpMessagingTemplate messagingTemplate) {
        this.porukaRepository = porukaRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @GetMapping(value = "/cet/{CetID}")
    public ResponseEntity<List<PorukaCeta>> getPorukeByCet(@PathVariable("CetID") int CetID) {
        return ResponseEntity.ok(this.porukaRepository.getPorukeByCet(CetID));
    }

    @PostMapping
    public ResponseEntity<PorukaCeta> sacuvajPoruku(@RequestBody PorukaCeta poruka) {
        PorukaCeta snimljenaPoruka = this.porukaRepository.sacuvajPoruku(poruka);
        if (snimljenaPoruka == null) return ResponseEntity.badRequest().build();

        emitujPoruku(snimljenaPoruka);
        return ResponseEntity.ok(snimljenaPoruka);
    }

    private void emitujPoruku(PorukaCeta poruka) {
        messagingTemplate.convertAndSend("/topic/cet/" + poruka.getCetID(), poruka);
        porukaRepository.getKorisniciZaCet(poruka.getCetID()).forEach((korisnikID) ->
                messagingTemplate.convertAndSend("/topic/korisnik/" + korisnikID + "/poruke", poruka)
        );
    }
}
