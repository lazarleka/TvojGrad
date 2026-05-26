package com.example.TvojGrad.services;

import com.example.TvojGrad.models.Grad;
import com.example.TvojGrad.repositories.GradRepositories;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GradService {

    private GradRepositories gradRepositories = null;

    public GradService(GradRepositories _gradRepositories) {
        this.gradRepositories = _gradRepositories;
    }

    public List<Grad> getAllGradovi() { return this.gradRepositories.getAllGradovi(); }
    public Grad getGradById(int ID) { return this.gradRepositories.getGradById(ID); }
    public Grad kreirajGrad(Grad g) { return this.gradRepositories.kreirajGrad(g); }
    public Grad azurirajGrad(int ID, Grad g) { return this.gradRepositories.azurirajGrad(ID, g); }
    public void obrisiGrad(int ID) { this.gradRepositories.obrisiGrad(ID); }
}