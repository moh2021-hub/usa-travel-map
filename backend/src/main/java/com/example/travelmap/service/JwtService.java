package com.example.travelmap.service;

import com.example.travelmap.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

/** Creates the login token handed to the browser after register or login. */
@Service
public class JwtService {

    private final JwtEncoder encoder;
    private final Duration timeToLive;

    public JwtService(JwtEncoder encoder, @Value("${app.jwt.ttl-days}") long ttlDays) {
        this.encoder = encoder;
        this.timeToLive = Duration.ofDays(ttlDays);
    }

    public String createToken(User user) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("travelmap")
                .subject(String.valueOf(user.getId()))
                .issuedAt(now)
                .expiresAt(now.plus(timeToLive))
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}
