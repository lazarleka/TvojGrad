package com.example.TvojGrad.controllers;

import com.example.TvojGrad.models.Grad;
import com.example.TvojGrad.services.GradService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/gradovi")
public class GradController {

    private GradService gradService = null;

    public GradController(GradService _gradService) {
        this.gradService = _gradService;
    }

    @GetMapping
    public List<Grad> getAllGradovi() { return this.gradService.getAllGradovi(); }

    @GetMapping(value = "/{ID}")
    public Grad getGradById(@PathVariable("ID") int ID) { return this.gradService.getGradById(ID); }

    @PostMapping
    public Grad kreirajGrad(@RequestBody Grad g) { return this.gradService.kreirajGrad(g); }

    @PutMapping(value = "/{ID}")
    public Grad azurirajGrad(@PathVariable("ID") int ID, @RequestBody Grad g) { return this.gradService.azurirajGrad(ID, g); }

    @DeleteMapping(value = "/{ID}")
    public void obrisiGrad(@PathVariable("ID") int ID) { this.gradService.obrisiGrad(ID); }
}