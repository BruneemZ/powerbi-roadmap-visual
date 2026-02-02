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

    redColor = new formattingSettings.ColorPicker({
        name: "redColor",
        displayName: "Couleur Red",
        value: { value: "#DC3545" }
    });

    amberColor = new formattingSettings.ColorPicker({
        name: "amberColor",
        displayName: "Couleur Amber",
        value: { value: "#FFC107" }
    });

    greenColor = new formattingSettings.ColorPicker({
        name: "greenColor",
        displayName: "Couleur Green",
        value: { value: "#28A745" }
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

    projectRowHeight = new formattingSettings.NumUpDown({
        name: "projectRowHeight",
        displayName: "Hauteur ligne projet",
        value: 40,
        options: {
            minValue: {
                type: powerbi.visuals.ValidatorType.Min,
                value: 30,
            },
            maxValue: {
                type: powerbi.visuals.ValidatorType.Max,
                value: 100,
            }
        }
    });

    milestoneRowHeight = new formattingSettings.NumUpDown({
        name: "milestoneRowHeight",
        displayName: "Hauteur ligne milestone",
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

    projectBackgroundColor = new formattingSettings.ColorPicker({
        name: "projectBackgroundColor",
        displayName: "Couleur fond projet",
        value: { value: "#e8f4f8" }
    });

    milestoneBackgroundColor1 = new formattingSettings.ColorPicker({
        name: "milestoneBackgroundColor1",
        displayName: "Couleur milestone (ligne 1)",
        value: { value: "#fafafa" }
    });

    milestoneBackgroundColor2 = new formattingSettings.ColorPicker({
        name: "milestoneBackgroundColor2",
        displayName: "Couleur milestone (ligne 2)",
        value: { value: "#ffffff" }
    });

    projectFontSize = new formattingSettings.NumUpDown({
        name: "projectFontSize",
        displayName: "Taille police projet",
        value: 12,
        options: {
            minValue: {
                type: powerbi.visuals.ValidatorType.Min,
                value: 8,
            },
            maxValue: {
                type: powerbi.visuals.ValidatorType.Max,
                value: 20,
            }
        }
    });

    milestoneFontSize = new formattingSettings.NumUpDown({
        name: "milestoneFontSize",
        displayName: "Taille police milestone",
        value: 10,
        options: {
            minValue: {
                type: powerbi.visuals.ValidatorType.Min,
                value: 8,
            },
            maxValue: {
                type: powerbi.visuals.ValidatorType.Max,
                value: 16,
            }
        }
    });

    dateLabelFontSize = new formattingSettings.NumUpDown({
        name: "dateLabelFontSize",
        displayName: "Taille police dates",
        value: 9,
        options: {
            minValue: {
                type: powerbi.visuals.ValidatorType.Min,
                value: 7,
            },
            maxValue: {
                type: powerbi.visuals.ValidatorType.Max,
                value: 14,
            }
        }
    });

    yearFontSize = new formattingSettings.NumUpDown({
        name: "yearFontSize",
        displayName: "Taille police année",
        value: 14,
        options: {
            minValue: {
                type: powerbi.visuals.ValidatorType.Min,
                value: 10,
            },
            maxValue: {
                type: powerbi.visuals.ValidatorType.Max,
                value: 20,
            }
        }
    });

    quarterFontSize = new formattingSettings.NumUpDown({
        name: "quarterFontSize",
        displayName: "Taille police trimestre",
        value: 12,
        options: {
            minValue: {
                type: powerbi.visuals.ValidatorType.Min,
                value: 8,
            },
            maxValue: {
                type: powerbi.visuals.ValidatorType.Max,
                value: 18,
            }
        }
    });

    name: string = "milestoneSettings";
    displayName: string = "Paramètres Milestones";
    slices: Array<FormattingSettingsSlice> = [
        this.triangleSize,
        this.redColor,
        this.amberColor,
        this.greenColor,
        this.showConnectingLines,
        this.quarterHeaderHeight,
        this.projectRowHeight,
        this.milestoneRowHeight,
        this.projectBackgroundColor,
        this.milestoneBackgroundColor1,
        this.milestoneBackgroundColor2,
        this.projectFontSize,
        this.milestoneFontSize,
        this.dateLabelFontSize,
        this.yearFontSize,
        this.quarterFontSize
    ];
}

/**
 * Paramètres de la timeline
 */
class TimelineSettingsCard extends FormattingSettingsCard {
    startYear = new formattingSettings.NumUpDown({
        name: "startYear",
        displayName: "Année de début",
        value: 2025,
        options: {
            minValue: {
                type: powerbi.visuals.ValidatorType.Min,
                value: 2020,
            },
            maxValue: {
                type: powerbi.visuals.ValidatorType.Max,
                value: 2050,
            }
        }
    });

    startMonth = new formattingSettings.NumUpDown({
        name: "startMonth",
        displayName: "Mois de début (1-12)",
        value: 1,
        options: {
            minValue: {
                type: powerbi.visuals.ValidatorType.Min,
                value: 1,
            },
            maxValue: {
                type: powerbi.visuals.ValidatorType.Max,
                value: 12,
            }
        }
    });

    endYear = new formattingSettings.NumUpDown({
        name: "endYear",
        displayName: "Année de fin",
        value: 2026,
        options: {
            minValue: {
                type: powerbi.visuals.ValidatorType.Min,
                value: 2020,
            },
            maxValue: {
                type: powerbi.visuals.ValidatorType.Max,
                value: 2050,
            }
        }
    });

    endMonth = new formattingSettings.NumUpDown({
        name: "endMonth",
        displayName: "Mois de fin (1-12)",
        value: 12,
        options: {
            minValue: {
                type: powerbi.visuals.ValidatorType.Min,
                value: 1,
            },
            maxValue: {
                type: powerbi.visuals.ValidatorType.Max,
                value: 12,
            }
        }
    });

    useCustomRange = new formattingSettings.ToggleSwitch({
        name: "useCustomRange",
        displayName: "Utiliser période personnalisée",
        value: false
    });

    name: string = "timelineSettings";
    displayName: string = "Paramètres Timeline";
    slices: Array<FormattingSettingsSlice> = [
        this.useCustomRange,
        this.startYear,
        this.startMonth,
        this.endYear,
        this.endMonth
    ];
}

/**
 * Modèle de paramètres du visuel
 */
export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    milestoneSettings = new MilestoneSettingsCard();
    timelineSettings = new TimelineSettingsCard();
    cards = [this.milestoneSettings, this.timelineSettings];
}
