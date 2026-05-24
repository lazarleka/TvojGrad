package com.example.TvojGrad.controllers;
import java.util.List;
import org.springframework.web.bind.annotation.*;
import com.example.TvojGrad.models.Dogadjaj;
import com.example.TvojGrad.services.DogadjajService;


@RestController
@RequestMapping(value="/dogadjaji")

public class DogadjajController {

    private DogadjajService dogadjajService=null;

    public DogadjajController(DogadjajService _dogadjajService) {
        this.dogadjajService=_dogadjajService;

    }


    @GetMapping
    public  List<Dogadjaj> getAllDogadjaji(){
        List<Dogadjaj> res=this.dogadjajService.getAllDogadjaji();
        return  res;

    }
   @GetMapping(value = "/{DogadjajID}")
    public Dogadjaj getDogadjajByID(@PathVariable("DogadjajID") int DogadjajID){
        Dogadjaj d= dogadjajService.getDogadjajById(DogadjajID);
        return d;
   }
    @PostMapping
    public Dogadjaj kreirajDogadjaj(@RequestBody Dogadjaj dogadjaj){
        return dogadjajService.kreirajDogadjaj(dogadjaj);
    }
    @PutMapping(value = "/{DogadjajID}")
    public Dogadjaj azurianjeDogadjaja(@PathVariable("DogadjajID") int DogadjajID, @RequestBody Dogadjaj dogg){
            return  dogadjajService.AzuritanjeDogadjaja(DogadjajID,dogg);
    }
    @DeleteMapping(value = "/{DogadjajID}")
    public void obrisiDogadjaj(@PathVariable("DogadjajID") int DogadjajID){


            dogadjajService.ObrisiDogadjaja(DogadjajID);
    }
}
