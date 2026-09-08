'use client'
import type { TextNode } from 'lexical';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    LexicalTypeaheadMenuPlugin,
    useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import { useCallback, useMemo, useState } from 'react';
import * as ReactDOM from 'react-dom';

import { type BlockOption, getBlockOptions, ICON_URLS } from './blockOptions';
import { ImageDropzone } from '../../ImageDropzone';

export function SlashMenuPlugin() {
    const [showImageDropzone, setShowImageDropzone] = useState(false);
    const [editor] = useLexicalComposerContext();
    const [queryString, setQueryString] = useState<string | null>(null);

    const options = useMemo(() => {
        const base = getBlockOptions(editor);
        if (!queryString) {
            return base;
        }
        const regex = new RegExp(queryString, 'i');
        return base.filter(
            o => regex.test(o.title) || o.keywords.some(k => regex.test(k)),
        );
    }, [editor, queryString]);

    const checkForTriggerMatch = useBasicTypeaheadTriggerMatch('/', {
        allowWhitespace: true,
        minLength: 0,
    });

    const onSelectOption = useCallback(
        (
            selectedOption: BlockOption,
            nodeToRemove: TextNode | null,
            closeMenu: () => void,
        ) => {
            if (selectedOption.isImage) {
                if (nodeToRemove !== null) {
                    editor.update(() => {
                        nodeToRemove.remove();
                    });
                }

                closeMenu();
                setShowImageDropzone(true);

                return;
            }

            editor.update(() => {
                if (nodeToRemove !== null) {
                    nodeToRemove.remove();
                }

                selectedOption.onSelect();
                closeMenu();
            });
        },
        [editor],
    );

    return (
        <>
            <LexicalTypeaheadMenuPlugin<BlockOption>
                onQueryChange={setQueryString}
                onSelectOption={onSelectOption}
                triggerFn={checkForTriggerMatch}
                options={options}
                menuRenderFn={(
                    anchorRef,
                    { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
                ) =>
                    anchorRef.current
                        ? ReactDOM.createPortal(
                            <div className="w-[220px] overflow-hidden rounded-lg border border-solid border-input bg-card text-card-foreground shadow-[0_8px_24px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
                                <ul className="m-0 max-h-[220px] list-none overflow-y-auto p-1">
                                    {options.map((option, i) => (
                                        <li
                                            key={option.key}
                                            ref={option.setRefElement}
                                            role="option"
                                            aria-selected={selectedIndex === i}
                                            className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-inherit ${selectedIndex === i ? 'bg-accent' : 'hover:bg-accent'}`}
                                            tabIndex={-1}
                                            onMouseEnter={() => setHighlightedIndex(i)}
                                            onClick={() => {
                                                setHighlightedIndex(i);
                                                selectOptionAndCleanUp(option);
                                            }}>
                                            <span
                                                className="inline-block h-4 w-4 shrink-0 [background-size:contain] bg-center bg-no-repeat opacity-70 dark:invert"
                                                style={{
                                                    backgroundImage: `url('${ICON_URLS[option.iconKey]}')`,
                                                }}
                                            />
                                            <span className="flex-1">{option.title}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>,
                            anchorRef.current,
                        )
                        : null
                }
            />
            {showImageDropzone ? (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 p-4">
                    <div className="w-full max-w-md rounded-xl border bg-card p-4 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-semibold">
                                Insert image
                            </h2>

                            <button
                                type="button"
                                onClick={() => setShowImageDropzone(false)}
                                className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent"
                            >
                                ×
                            </button>
                        </div>

                        <ImageDropzone
                            editor={editor}
                            uploadImage={async (file) => {
                                const src = URL.createObjectURL(file);

                                return {
                                    src,
                                    altText: file.name,
                                };
                            }}
                            onComplete={() => {
                                setShowImageDropzone(false);
                            }}
                        />
                    </div>
                </div>
            ) : null}
        </>
    );
}
