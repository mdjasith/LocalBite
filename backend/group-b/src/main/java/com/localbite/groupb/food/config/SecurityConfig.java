package com.localbite.groupb.food.config;

import com.localbite.groupb.food.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(
                                "/actuator/**",
                                "/api/foods/health",
                                "/api/categories/health",
                                "/api/carts/health",
                                "/api/orders/health"
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET,
                                "/api/foods",
                                "/api/foods/*",
                                "/api/foods/seller/*",
                                "/api/foods/category/*",
                                "/api/foods/search",
                                "/api/categories",
                                "/api/categories/*"
                        ).permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/foods/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/foods/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/foods/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/categories").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/categories/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/categories/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/foods").hasRole("SELLER")
                        .requestMatchers(HttpMethod.PUT, "/api/foods/*").hasRole("SELLER")
                        .requestMatchers(HttpMethod.PUT, "/api/foods/*/availability").hasRole("SELLER")
                        .requestMatchers(HttpMethod.PUT, "/api/foods/*/stock").hasRole("SELLER")
                        .requestMatchers(HttpMethod.DELETE, "/api/foods/*").hasRole("SELLER")
                        .requestMatchers(HttpMethod.PUT, "/api/foods/*/adjust-stock").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/foods/*/check-stock").authenticated()
                        .anyRequest().authenticated()
                )
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}