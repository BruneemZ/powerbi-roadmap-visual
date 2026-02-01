import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import powerbi from "powerbi-visuals-api";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

/**
 * Paramètres des milestones
 */
class MilestoneSettingsCard extends FormattingSettingsCard {
    triangleSize = new formattingSettings.NumUpDown({
        name: "triangleSize",
        displayName: "Taille des triangles",
        value: 12,
        options: {
            minValue: {
                type: powerbi.visuals.ValidatorType.Min,
                value: 8,
            },
            maxValue: {
                type: powerbi.visuals.ValidatorType.Max,
                value: 24,
            }
        }
    });

    plannedColor = new formattingSettings.ColorPicker({
        name: "plannedColor",
        displayName: "Couleur Planifié",
        value: { value: "#808080" }
    });

    inProgressColor = new formattingSettings.ColorPicker({
        name: "inProgressColor",
        displayName: "Couleur En cours",
        value: { value: "#FFA500" }
    });

    completedColor = new formattingSettings.ColorPicker({
        name: "completedColor",
        displayName: "Couleur Terminé",
        value: { value: "#4CAF50" }
    });

    showConnectingLines = new formattingSettings.ToggleSwitch({
        name: "showConnectingLines",
        displayName: "Afficher les lignes de connexion",
        value: true
    });

    quarterHeaderHeight = new formattingSettings.NumUpDown({
        name: "quarterHeaderHeight",
        displayName: "Hauteur en-tête trimestres",
        value: 60,
        options: {
            minValue: {
                type: powerbi.visuals.ValidatorType.Min,
                value: 40,
            },
            maxValue: {
                type: powerbi.visuals.ValidatorType.Max,
                value: 100,
            }
        }
    });

    rowHeight = new formattingSettings.NumUpDown({
        name: "rowHeight",
        displayName: "Hauteur des lignes",
        value: 40,
        options: {
            minValue: {
                type: powerbi.visuals.ValidatorType.Min,
                value: 30,
            },
            maxValue: {
                type: powerbi.visuals.ValidatorType.Max,
                value: 80,
            }
        }
    });

    name: string = "milestoneSettings";
    displayName: string = "Paramètres Milestones";
    slices: Array<FormattingSettingsSlice> = [
        this.triangleSize,
        this.plannedColor,
        this.inProgressColor,
        this.completedColor,
        this.showConnectingLines,
        this.quarterHeaderHeight,
        this.rowHeight
    ];
}

/**
 * Modèle de paramètres du visuel
 */
export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    milestoneSettings = new MilestoneSettingsCard();
    cards = [this.milestoneSettings];
}
