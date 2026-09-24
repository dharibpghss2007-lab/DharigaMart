package com.dharigamart.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Login is the first page of DHARIGA MART.
 * The root URL redirects to login.html.
 */
@Controller
public class HomeController {

    @GetMapping({"/", "/home", "/login"})
    public String login() {
        return "redirect:/login.html";
    }
}