package com.example.TvojGrad.controllers;

import com.example.TvojGrad.models.Tip;
import com.example.TvojGrad.services.TipService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/tipovi")
public class TipController {

    private TipService tipService = null;

    public TipController(TipService _tipService) {
        this.tipService = _tipService;
    }

    @GetMapping
    public List<Tip> getAllTipovi() { return this.tipService.getAllTipovi(); }

    @GetMapping(value = "/{ID}")
    public Tip getTipById(@PathVariable("ID") int ID) { return this.tipService.getTipById(ID); }

    @PostMapping
    public Tip kreirajTip(@RequestBody Tip t) { return this.tipService.kreirajTip(t); }

    @PutMapping(value = "/{ID}")
    public Tip azurirajTip(@PathVariable("ID") int ID, @RequestBody Tip t) { return this.tipService.azurirajTip(ID, t); }

    @DeleteMapping(value = "/{ID}")
    public void obrisiTip(@PathVariable("ID") int ID) { this.tipService.obrisiTip(ID); }
}