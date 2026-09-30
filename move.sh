#!/usr/bin/env bash
cd "$(dirname "$0")" || exit 1

m() {  # m origen destino  (nunca sobrescribe ni borra)
  if [ ! -e "$1" ]; then echo "SKIP (no existe):  $1"; return; fi
  if [ -e "$2" ]; then echo "CONFLICTO (destino ya existe, no se mueve): $1 -> $2"; return; fi
  mkdir -p "$(dirname "$2")"
  git mv "$1" "$2" 2>/dev/null || mv -n "$1" "$2"
  echo "OK: $1 -> $2"
}

# ---------- 1. shadcn: app/components/ui -> components/ui ----------
m app/components/ui/site-header.tsx components/layout/site-header.tsx
for f in app/components/ui/*; do m "$f" "components/ui/$(basename "$f")"; done

# ---------- 2. providers ----------
m components/Providers components/providers_tmp   # evita problemas de mayúsculas
m components/providers_tmp components/providers
# el duplicado de src no se borra: va a _legacy para comparar
m src/components/providers/theme-provider.tsx _legacy/theme-provider.src.tsx

# ---------- 3. changer/shared -> components ----------
m changer/shared/ComboBox.tsx          components/shared/combo-box.tsx
m changer/shared/CustomIcon.tsx        components/shared/custom-icon.tsx
m changer/shared/DatePicker.tsx        components/shared/date-picker.tsx
m changer/shared/Pagination.tsx        components/shared/pagination.tsx
m changer/shared/Masonry               components/shared/masonry
m changer/shared/language-switcher.tsx components/layout/language-switcher.tsx
m changer/shared/theme-changer.tsx     components/layout/theme-changer.tsx

# ---------- 4. emails ----------
m custom-icon/emails/email-template.tsx          components/emails/email-template.tsx
m custom-icon/emails/newletter-welcome-email.tsx components/emails/newsletter-welcome-email.tsx

# ---------- 5. newsletter ----------
m sortable-media/newsletter/newsletter-subscriptors.tsx features/newsletter/newsletter-subscriptors.tsx

# ---------- 6. types y utils salen de hooks ----------
m hooks/types types
m hooks/utils utils

# ---------- 7. contenido de src/ ----------
D=src/components/dashboard/components
m src/components/auth/SignIn.tsx        features/auth/sign-in.tsx

m $D/app-sidebar.tsx                    components/layout/app-sidebar.tsx
m $D/dashboard-header.tsx               components/layout/dashboard-header.tsx

m $D/editor                             features/editor/editor
m $D/CodeMirror.tsx                     features/editor/CodeMirror.tsx
m $D/ResizableImage.tsx                 features/editor/ResizableImage.tsx

m $D/media-editor                       features/media/media-editor
m $D/ImageDropzone.tsx                  features/media/ImageDropzone.tsx
m $D/MediaCarrousel.tsx                 features/media/MediaCarrousel.tsx
m $D/SortableMedia.tsx                  features/media/SortableMedia.tsx
m $D/youtube-preview.tsx                features/media/youtube-preview.tsx

m $D/CategoryComboBox.tsx               features/post/CategoryComboBox.tsx
m $D/FileForm.tsx                       features/post/FileForm.tsx
m $D/EmptyFile.tsx                      features/blog/EmptyFile.tsx
m $D/blog-post-skeleton-page.tsx        features/blog/blog-post-skeleton-page.tsx
m $D/uploadthing-chart.tsx              features/dashboard/uploadthing-chart.tsx

# ---------- 8. sin usos detectados: a _legacy/ (NO se borran) ----------
m $D/FileCarrousel.tsx                  _legacy/FileCarrousel.tsx
m $D/SortableFile.tsx                   _legacy/SortableFile.tsx
m $D/ImageEditor.tsx                    _legacy/ImageEditor.tsx
m $D/media-editor-demo.tsx              _legacy/media-editor-demo.tsx

# ---------- 9. otros ----------
m lib/mailtrap.conf.ts lib/mails/mailtrap.conf.ts

# ---------- 10. informes (solo listan, no tocan nada) ----------
echo; echo "Archivos que aún quedan en src/:"
find src -type f 2>/dev/null
echo; echo "Carpetas vacías (puedes borrarlas tú cuando quieras):"
find . -type d -empty -not -path './node_modules/*' -not -path './.git/*' -not -path './.next/*'
