<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require "vendor/autoload.php";

// ── En-têtes JSON ─────────────────────────────────────────────────────
header("Content-Type: application/json; charset=utf-8");
header("X-Content-Type-Options: nosniff");

// ── POST uniquement ───────────────────────────────────────────────────
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  echo json_encode(["success" => false, "message" => "Méthode non autorisée."]);
  exit();
}

// ── Rate limiting : 3 envois max / session / heure ────────────────────
session_start();
$now = time();
$_SESSION["contact_sends"] ??= [];
$_SESSION["contact_sends"] = array_values(
  array_filter(
    $_SESSION["contact_sends"],
    fn(int $t): bool => $now - $t < 3600,
  ),
);
if (count($_SESSION["contact_sends"]) >= 3) {
  http_response_code(429);
  echo json_encode([
    "success" => false,
    "message" => "Trop de tentatives. Réessayez dans une heure.",
  ]);
  exit();
}

// ── Honeypot anti-spam ────────────────────────────────────────────────
if (!empty($_POST["website"])) {
  echo json_encode(["success" => true, "message" => "Message envoyé."]);
  exit();
}

// ── Sanitize ──────────────────────────────────────────────────────────
function clean(string $v): string
{
  return trim(strip_tags($v));
}
function cleanHeader(string $v): string
{
  return preg_replace('/[\r\n\t]+/', " ", clean($v));
}

$name = cleanHeader($_POST["name"] ?? "");
$email = clean($_POST["email"] ?? "");
$phone = clean($_POST["phone"] ?? "");
$service = clean($_POST["service"] ?? "");
$message = clean($_POST["message"] ?? "");

// ── Validation ────────────────────────────────────────────────────────
$errors = [];
if (strlen($name) < 2) {
  $errors[] = "Veuillez renseigner votre nom complet.";
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  $errors[] = "L'adresse e-mail est invalide.";
}
if (strlen($message) < 10) {
  $errors[] = "Votre message est trop court (minimum 10 caractères).";
}

if (!empty($errors)) {
  http_response_code(422);
  echo json_encode(["success" => false, "message" => implode(" ", $errors)]);
  exit();
}

// ── Lecture du mot de passe depuis .env ───────────────────────────────
$env = parse_ini_file(__DIR__ . "/.env");
if ($env === false || empty($env["GMAIL_APP_PASSWORD"])) {
  error_log(
    "[ByMobility] Fichier .env manquant ou GMAIL_APP_PASSWORD non défini.",
  );
  http_response_code(500);
  echo json_encode([
    "success" => false,
    "message" => "Erreur de configuration serveur.",
  ]);
  exit();
}

// ── Libellés de service ───────────────────────────────────────────────
$labels = [
  "courte-duree" => "Location courte durée",
  "bail-mobilite" => "Bail mobilité",
  "autre" => "Autre demande",
];
$serviceLabel = $labels[$service] ?? "Non précisé";

// ── Envoi via PHPMailer ───────────────────────────────────────────────
$mail = new PHPMailer(true);

try {
  // Serveur SMTP Google
  $mail->isSMTP();
  $mail->Host = "smtp.gmail.com";
  $mail->SMTPAuth = true;
  $mail->Username = "lrd@bymobility.fr";
  $mail->Password = $env["GMAIL_APP_PASSWORD"];
  $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
  $mail->Port = 587;
  $mail->CharSet = "UTF-8";

  // Expéditeur & destinataire
  $mail->setFrom("lrd@bymobility.fr", "By Mobility Website");
  $mail->addAddress("contact@bymobility.fr");
  $mail->addReplyTo($email, $name);

  // Sujet
  $mail->Subject = "Nouvelle demande – " . $name;

  // Corps HTML
  $mail->isHTML(true);
  $mail->Body =
    '
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a2b4a;">
            <div style="background:#1a2b4a;padding:24px 32px;">
                <h1 style="color:#c9a96e;margin:0;font-size:20px;">By Mobility – Nouvelle demande</h1>
            </div>
            <div style="padding:32px;background:#f5f1ea;border:1px solid #ede7db;">
                <table style="width:100%;border-collapse:collapse;">
                    <tr><td style="padding:8px 0;font-weight:bold;width:120px;">Nom</td><td style="padding:8px 0;">' .
    htmlspecialchars($name) .
    '</td></tr>
                    <tr><td style="padding:8px 0;font-weight:bold;">Email</td><td style="padding:8px 0;"><a href="mailto:' .
    htmlspecialchars($email) .
    '" style="color:#c9a96e;">' .
    htmlspecialchars($email) .
    '</a></td></tr>
                    <tr><td style="padding:8px 0;font-weight:bold;">Téléphone</td><td style="padding:8px 0;">' .
    htmlspecialchars($phone ?: "Non renseigné") .
    '</td></tr>
                    <tr><td style="padding:8px 0;font-weight:bold;">Service</td><td style="padding:8px 0;">' .
    htmlspecialchars($serviceLabel) .
    '</td></tr>
                </table>
                <hr style="border:none;border-top:1px solid #d9c3a0;margin:20px 0;">
                <p style="font-weight:bold;margin:0 0 8px;">Message :</p>
                <p style="margin:0;line-height:1.7;white-space:pre-wrap;">' .
    htmlspecialchars($message) .
    '</p>
            </div>
            <div style="padding:16px 32px;background:#ede7db;font-size:12px;color:#78909c;">
                Envoyé le ' .
    date("d/m/Y à H:i") .
    ' via bymobility.fr
            </div>
        </div>
    ';

  // Version texte brut
  $mail->AltBody =
    "Nouvelle demande – " .
    $name .
    "\n\n" .
    "Nom       : " .
    $name .
    "\n" .
    "Email     : " .
    $email .
    "\n" .
    "Téléphone : " .
    ($phone ?: "Non renseigné") .
    "\n" .
    "Service   : " .
    $serviceLabel .
    "\n\n" .
    "Message :\n" .
    $message .
    "\n\n" .
    "Envoyé le " .
    date("d/m/Y à H:i") .
    " via bymobility.fr";

  $mail->send();

  $_SESSION["contact_sends"][] = $now;
  echo json_encode([
    "success" => true,
    "message" =>
      "Votre message a bien été envoyé. Nous vous répondrons sous 24h.",
  ]);
} catch (Exception $e) {
  error_log("[ByMobility] Erreur PHPMailer : " . $mail->ErrorInfo);
  http_response_code(500);
  echo json_encode([
    "success" => false,
    "message" =>
      "Une erreur est survenue lors de l'envoi. Contactez-nous directement à contact@bymobility.fr.",
  ]);
}
