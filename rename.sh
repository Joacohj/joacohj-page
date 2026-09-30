#!/usr/bin/env bash
cd "$(dirname "$0")" || exit 1

RENAMED=()   # guarda "viejo_sin_ext|nuevo_sin_ext"

r() {  # r ruta/vieja.ext nuevo-nombre.ext   (mismo directorio, nunca sobrescribe)
  local old="$1" new="$(dirname "$1")/$2"
  if [ ! -e "$old" ]; then echo "SKIP (no existe): $old"; return; fi
  if [ -e "$new" ]; then echo "CONFLICTO (ya existe): $new"; return; fi
  git mv "$old" "$new" 2>/dev/null || mv -n "$old" "$new"
  echo "OK: $old -> $new"
  local ob nb
  ob="$(basename "${old%.*}")"; nb="${2%.*}"
  RENAMED+=("$ob|$nb")
}

# ---------- features/auth ----------
r features/auth/sign-in.tsx                       sign-in-form.tsx

# ---------- features/editor ----------
r features/editor/editor/Editor.tsx               rich-text-editor.tsx
r features/editor/CodeMirror.tsx                  code-mirror.tsx
r features/editor/ResizableImage.tsx              resizable-image.tsx
P=features/editor/editor/plugins
r $P/blockOptions.tsx                             block-options.tsx
r $P/CodeMirrorExtension.ts                       code-mirror-extension.ts
r $P/CodeMirrorNode.tsx                           code-mirror-node.tsx
r $P/DragPlugin.tsx                               drag-plugin.tsx
r $P/ImageExtension.ts                            image-extension.ts
r $P/ImageNode.tsx                                image-node.tsx
r $P/SlashMenuPlugin.tsx                          slash-menu-plugin.tsx

# ---------- features/media ----------
r features/media/ImageDropzone.tsx                image-dropzone.tsx
r features/media/MediaCarrousel.tsx               media-carousel.tsx
r features/media/SortableMedia.tsx                sortable-media.tsx

# ---------- features/post / blog / dashboard / newsletter ----------
r features/post/CategoryComboBox.tsx              category-combo-box.tsx
r features/post/FileForm.tsx                      post-form.tsx
r features/blog/EmptyFile.tsx                     empty-state.tsx
r features/blog/blog-post-skeleton-page.tsx       post-skeleton.tsx
r features/dashboard/uploadthing-chart.tsx        uploadthing-usage-chart.tsx
r features/newsletter/newsletter-subscriptors.tsx newsletter-subscribers.tsx

# ---------- lib ----------
r lib/mails/mailSender.ts                         mail-sender.ts
r lib/mails/mailtrap.conf.ts                      mailtrap-config.ts
r lib/media/mediaOptimizer.ts                     media-optimizer.ts
r lib/media/images/imageOptimizer.ts              image-optimizer.ts
r lib/media/video/videoOptimizer.ts               video-optimizer.ts

# ---------- actualizar imports ----------
echo; echo "Actualizando imports..."
FILES=$(find . -type f \( -name '*.ts' -o -name '*.tsx' \) \
  -not -path './node_modules/*' -not -path './.next/*' -not -path './.git/*' -not -path './generated/*')

for pair in "${RENAMED[@]}"; do
  ob="${pair%%|*}"; nb="${pair##*|}"
  ob_esc="${ob//./\\.}"
  # solo cambia el ultimo segmento de una ruta de import: /Viejo" o /Viejo'
  echo "$FILES" | tr '\n' '\0' | xargs -0 sed -i "s#/${ob_esc}\([\"']\)#/${nb}\1#g"
  echo "  $ob -> $nb"
done

echo; echo "Listo. Ahora corre: npx tsc --noEmit"
