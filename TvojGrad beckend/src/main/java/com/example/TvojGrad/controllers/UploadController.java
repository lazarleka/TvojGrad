package com.example.TvojGrad.controllers;

import com.example.TvojGrad.models.Dogadjaj;
import com.example.TvojGrad.models.Korisnik;
import com.example.TvojGrad.services.DogadjajService;
import com.example.TvojGrad.services.KorisnikService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping(value = "/uploads")
public class UploadController {

    private final KorisnikService korisnikService;
    private final DogadjajService dogadjajService;
    private final Path uploadRoot = Paths.get("uploads").toAbsolutePath().normalize();

    public UploadController(KorisnikService korisnikService, DogadjajService dogadjajService) {
        this.korisnikService = korisnikService;
        this.dogadjajService = dogadjajService;
    }

    @PostMapping(value = "/korisnici/{ID}/profilna")
    public ResponseEntity<?> uploadProfilna(@PathVariable("ID") int ID, @RequestParam("file") MultipartFile file) {
        try {
            String url = saveFile(file, "profili", "korisnik-" + ID);
            Korisnik korisnik = korisnikService.azurirajProfilnu(ID, url);
            return ResponseEntity.ok(korisnik);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage() != null ? e.getMessage() : "Slika nije sacuvana");
        }
    }

    @PostMapping(value = "/dogadjaji/{ID}/slika")
    public ResponseEntity<?> uploadSlikaDogadjaja(@PathVariable("ID") int ID, @RequestParam("file") MultipartFile file) {
        try {
            String url = saveFile(file, "dogadjaji", "dogadjaj-" + ID);
            Dogadjaj dogadjaj = dogadjajService.azurirajSliku(ID, url);
            return ResponseEntity.ok(dogadjaj);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Slika nije sacuvana");
        }
    }

    private String saveFile(MultipartFile file, String folder, String basename) throws Exception {
        if (file == null || file.isEmpty() || file.getContentType() == null || !file.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("Dozvoljene su samo slike");
        }
        if (file.getSize() > 15L * 1024L * 1024L) {
            throw new IllegalArgumentException("Slika je prevelika. Maksimalna veličina je 15 MB");
        }
        Path targetFolder = uploadRoot.resolve(folder).normalize();
        Files.createDirectories(targetFolder);
        String extension = extensionFor(file.getOriginalFilename(), file.getContentType());
        String filename = basename + "-" + System.currentTimeMillis() + extension;
        Path target = targetFolder.resolve(filename).normalize();
        if (!target.startsWith(targetFolder)) {
            throw new IllegalArgumentException("Neispravna putanja");
        }
        file.transferTo(target);
        return "/uploads/" + folder + "/" + filename;
    }

    private String extensionFor(String originalFilename, String contentType) {
        if (originalFilename != null && originalFilename.contains(".")) {
            String ext = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase(Locale.ROOT);
            if (ext.matches("\\.(png|jpg|jpeg|webp|gif|avif)")) return ext;
        }
        if (contentType.endsWith("png")) return ".png";
        if (contentType.endsWith("webp")) return ".webp";
        if (contentType.endsWith("gif")) return ".gif";
        if (contentType.endsWith("avif")) return ".avif";
        return ".jpg";
    }
}
