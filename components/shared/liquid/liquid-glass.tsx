"use client";

import { Share1Icon } from "@radix-ui/react-icons";
import styles from "./LiquidButton.module.css";
import Icon from "../custom-icon";
import React from "react";

export function LiquidButton({children, onClick}: {children?: React.ReactElement, onClick?: () => void}) {
  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div
          className={`${styles.box} ${styles.startButton}`}
          style={
            {
              "--w": "55px",
              "--h": "55px",
              "--tr": "15%",
            } as React.CSSProperties
          }
        >
          {/* <span className={styles.buttonText}>Get started</span> */}

          <div className={styles.buttonIcon}>
            {children}
          </div>

          <div className={styles.circleOverlay} />
        </div>
      </div>
    </div>
  );
}