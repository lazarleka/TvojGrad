package com.example.TvojGrad.services;

import com.example.TvojGrad.models.Tip;
import com.example.TvojGrad.repositories.TipRepositories;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TipService {

    private TipRepositories tipRepositories = null;

    public TipService(TipRepositories _tipRepositories) {
        this.tipRepositories = _tipRepositories;
    }

    public List<Tip> getAllTipovi() { return this.tipRepositories.getAllTipovi(); }
    public Tip getTipById(int ID) { return this.tipRepositories.getTipById(ID); }
    public Tip kreirajTip(Tip t) { return this.tipRepositories.kreirajTip(t); }
    public Tip azurirajTip(int ID, Tip t) { return this.tipRepositories.azurirajTip(ID, t); }
    public void obrisiTip(int ID) { this.tipRepositories.obrisiTip(ID); }
}