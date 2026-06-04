package com.example.TvojGrad.controllers;

import com.example.TvojGrad.models.PorukaCeta;
import com.example.TvojGrad.repositories.PorukaCetaRepository;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final PorukaCetaRepository porukaRepository;

    public ChatWebSocketController(SimpMessagingTemplate messagingTemplate, PorukaCetaRepository porukaRepository) {
        this.messagingTemplate = messagingTemplate;
        this.porukaRepository = porukaRepository;
    }

    // Kada klijent pošalje poruku na /app/chat.posalji, ova metoda je hvata
    @MessageMapping("/chat.posalji")
    public void procesuirajPoruku(@Payload PorukaCeta poruka) {
        // 1. Prvo upiši poruku u MySQL bazu da ostane sačuvana
        PorukaCeta snimljenaPoruka = porukaRepository.sacuvajPoruku(poruka);

        if (snimljenaPoruka != null) {
            // 2. Prolijedi poruku SVIMA koji slušaju sobu sa tim ID-jem četa
            // Klijenti na frontendu će slušati rutu: /topic/cet/{ID_CETA}
            messagingTemplate.convertAndSend("/topic/cet/" + poruka.getCetID(), snimljenaPoruka);
            porukaRepository.getKorisniciZaCet(poruka.getCetID()).forEach((korisnikID) ->
                    messagingTemplate.convertAndSend("/topic/korisnik/" + korisnikID + "/poruke", snimljenaPoruka)
            );
        }
    }
}
