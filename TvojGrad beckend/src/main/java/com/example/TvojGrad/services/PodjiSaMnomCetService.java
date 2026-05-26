
package com.example.TvojGrad.services;

import com.example.TvojGrad.models.PodjiSaMnomCet;
import com.example.TvojGrad.repositories.PodjiSaMnomCetRepositories;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PodjiSaMnomCetService {

    private final PodjiSaMnomCetRepositories cetRepositories;

    public PodjiSaMnomCetService(PodjiSaMnomCetRepositories _cetRepositories) {
        this.cetRepositories = _cetRepositories;
    }

    public List<PodjiSaMnomCet> getAllCetovi() { return this.cetRepositories.getAllCetovi(); }
    public PodjiSaMnomCet getCetById(int ID) { return this.cetRepositories.getCetById(ID); }
    public PodjiSaMnomCet kreirajCet(PodjiSaMnomCet c) { return this.cetRepositories.kreirajCet(c); }
    public PodjiSaMnomCet azurirajCet(int ID, PodjiSaMnomCet c) { return this.cetRepositories.azurirajCet(ID, c); }
    public void obrisiCet(int ID) { this.cetRepositories.obrisiCet(ID); }
}