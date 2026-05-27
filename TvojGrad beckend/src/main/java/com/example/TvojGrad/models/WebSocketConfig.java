package com.example.TvojGrad.models;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Klijenti slušaju (subskrajbuju se) na rute koje počinju sa /topic
        config.enableSimpleBroker("/topic");
        // Klijenti šalju poruke serveru na rute koje počinju sa /app
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Glavna rupa (endpoint) za povezivanje sa frontenda
        registry.addEndpoint("/ws-tvojgrad")
                .setAllowedOrigins("http://localhost:5173") // URL tvog React-a (Vite)
                .withSockJS(); // Omogućava fallback opcije ako browser ne podržava čist WS
    }
}