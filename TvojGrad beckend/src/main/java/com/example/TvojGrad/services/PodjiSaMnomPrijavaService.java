package com.example.TvojGrad.services;

import com.example.TvojGrad.models.PodjiSaMnomPrijava;
import com.example.TvojGrad.repositories.PodjiSaMnomPrijavaRepositories;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PodjiSaMnomPrijavaService {

    private final PodjiSaMnomPrijavaRepositories prijavaRepositories;

    public PodjiSaMnomPrijavaService(PodjiSaMnomPrijavaRepositories _prijavaRepositories) {
        this.prijavaRepositories = _prijavaRepositories;
    }

    public List<PodjiSaMnomPrijava> getAllPrijave() { return this.prijavaRepositories.getAllPrijave(); }
    public PodjiSaMnomPrijava getPrijavaById(int ID) { return this.prijavaRepositories.getPrijavaById(ID); }
    public List<PodjiSaMnomPrijava> getPrijaveByObjava(int ObjavaID) { return this.prijavaRepositories.getPrijaveByObjava(ObjavaID); }
    public PodjiSaMnomPrijava kreirajPrijavu(PodjiSaMnomPrijava p) { return this.prijavaRepositories.kreirajPrijavu(p); }
    public PodjiSaMnomPrijava azurirajPrijavu(int ID, PodjiSaMnomPrijava p) { return this.prijavaRepositories.azurirajPrijavu(ID, p); }
    public void obrisiPrijavu(int ID) { this.prijavaRepositories.obrisiPrijavu(ID); }
}