package com.example.TvojGrad.controllers;

import com.example.TvojGrad.models.PorukaCeta;
import com.example.TvojGrad.repositories.PorukaCetaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping(value = "/poruke-ceta")
public class PorukaCetaController {

    private final PorukaCetaRepository porukaRepository;

    public PorukaCetaController(PorukaCetaRepository porukaRepository) {
        this.porukaRepository = porukaRepository;
    }

    @GetMapping(value = "/cet/{CetID}")
    public ResponseEntity<List<PorukaCeta>> getPorukeByCet(@PathVariable("CetID") int CetID) {
        return ResponseEntity.ok(this.porukaRepository.getPorukeByCet(CetID));
    }
}
