import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.0.0:1',
  releaseNotes: {
    en_US: `Reworked RSVP flow and updated the StartOS wrapper to the current SDK.

- RSVP is now a single form: guests search by the party name on their invitation, then enter each attendee's name and meal themselves, up to a per-party guest limit (set by you, default 1).
- **Breaking:** updating clears all pre-entered guest entries and any recorded responses. Email addresses are preserved (moved onto the party), and every invitation is reset to pending, so guests will RSVP again through the new form.
- Alternating section colors and a "Where to Stay" navigation entry on the home page.
- Service logs now show real client IPs, and the RSVP audit log keeps working.`,
    es_ES: `Se rediseñó el flujo de RSVP y se actualizó el wrapper de StartOS al SDK actual.

- El RSVP ahora es un solo formulario: los invitados buscan por el nombre del grupo en su invitación y escriben ellos mismos el nombre y el menú de cada asistente, hasta un límite por grupo (configurado por ti, por defecto 1).
- **Cambio importante:** la actualización borra los invitados precargados y las respuestas registradas. Los correos se conservan (se mueven al grupo) y todas las invitaciones vuelven a estado pendiente, así que los invitados responderán de nuevo con el nuevo formulario.
- Colores alternos en las secciones y una entrada "Where to Stay" en la navegación de la página principal.
- Los registros del servicio ahora muestran las IP reales de los clientes y el registro de auditoría de RSVP sigue funcionando.`,
    de_DE: `Überarbeiteter RSVP-Ablauf und Aktualisierung des StartOS-Wrappers auf das aktuelle SDK.

- RSVP ist jetzt ein einziges Formular: Gäste suchen nach dem Gruppennamen auf ihrer Einladung und tragen Name und Menüwahl jedes Gastes selbst ein, bis zu einem Gästelimit pro Gruppe (von dir festgelegt, Standard 1).
- **Wichtig:** Das Update löscht alle vorab eingetragenen Gäste und erfasste Antworten. E-Mail-Adressen bleiben erhalten (sie wandern zur Gruppe) und alle Einladungen gelten wieder als ausstehend; Gäste antworten erneut über das neue Formular.
- Abwechselnde Abschnittsfarben und ein "Where to Stay"-Navigationseintrag auf der Startseite.
- Dienstprotokolle zeigen jetzt echte Client-IPs, das RSVP-Audit-Log funktioniert weiterhin.`,
    pl_PL: `Przebudowany proces RSVP i aktualizacja wrappera StartOS do aktualnego SDK.

- RSVP to teraz jeden formularz: goście wyszukują po nazwie grupy z zaproszenia i sami wpisują imię oraz wybór dania każdego uczestnika, do limitu gości na grupę (ustawianego przez Ciebie, domyślnie 1).
- **Uwaga:** aktualizacja usuwa wcześniej wprowadzonych gości i zapisane odpowiedzi. Adresy e-mail zostają zachowane (przeniesione do grupy), a wszystkie zaproszenia wracają do stanu oczekującego — goście odpowiedzą ponownie przez nowy formularz.
- Naprzemienne kolory sekcji i pozycja "Where to Stay" w nawigacji strony głównej.
- Logi usługi pokazują teraz prawdziwe adresy IP klientów, a dziennik audytu RSVP działa dalej.`,
    fr_FR: `Refonte du parcours RSVP et mise à jour du wrapper StartOS vers le SDK actuel.

- Le RSVP est désormais un formulaire unique : les invités cherchent le nom de leur groupe tel qu'imprimé sur l'invitation, puis saisissent eux-mêmes le nom et le menu de chaque convive, dans la limite d'invités par groupe (fixée par vous, 1 par défaut).
- **Important :** la mise à jour efface les invités pré-saisis et les réponses enregistrées. Les adresses e-mail sont conservées (déplacées vers le groupe) et toutes les invitations repassent en attente ; les invités répondront à nouveau via le nouveau formulaire.
- Couleurs de sections alternées et entrée « Where to Stay » dans la navigation de la page d'accueil.
- Les journaux du service affichent désormais les vraies IP clientes et le journal d'audit RSVP continue de fonctionner.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
