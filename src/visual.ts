import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { VisualFormattingSettingsModel } from "./settings";
import * as d3 from "d3";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import DataView = powerbi.DataView;

export interface MilestoneDataPoint {
    projectId: string;
    projectName: string;
    projectInfo: string;
    milestoneName: string;
    initialDate: Date;
    revisedDate: Date | null;
    status: string;
    category: string;
}

export interface ProjectGroup {
    projectId: string;
    projectName: string;
    projectInfo: string;
    milestones: MilestoneDataPoint[];
}

export class Visual implements IVisual {
    private target: HTMLElement;
    private svg: d3.Selection<SVGElement, any, any, any>;
    private container: d3.Selection<SVGGElement, any, any, any>;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    private dataPoints: MilestoneDataPoint[];

    constructor(options: VisualConstructorOptions) {
        this.formattingSettingsService = new FormattingSettingsService();
        this.target = options.element;

        // Créer l'élément SVG principal
        this.svg = d3.select(this.target)
            .append("svg")
            .classed("roadmap-svg", true);

        this.container = this.svg
            .append("g")
            .classed("roadmap-container", true);
    }

    public update(options: VisualUpdateOptions): void {
        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(
            VisualFormattingSettingsModel,
            options.dataViews[0]
        );

        // Récupérer les dimensions
        const width = options.viewport.width;
        const height = options.viewport.height;

        this.svg
            .attr("width", width)
            .attr("height", height);

        // Traiter les données
        this.dataPoints = this.transformData(options.dataViews[0]);

        if (!this.dataPoints || this.dataPoints.length === 0) {
            this.renderEmptyState(width, height);
            return;
        }

        this.renderRoadmap(width, height);
    }

    private transformData(dataView: DataView): MilestoneDataPoint[] {
        if (!dataView ||
            !dataView.table ||
            !dataView.table.rows ||
            dataView.table.rows.length === 0) {
            return [];
        }

        const table = dataView.table;
        const rows = table.rows;
        const columns = table.columns;

        // Créer un mapping des rôles vers les indices de colonnes
        const columnMapping: { [key: string]: number } = {};
        columns.forEach((column, index) => {
            if (column.roles) {
                if (column.roles['projectId']) columnMapping['projectId'] = index;
                if (column.roles['projectName']) columnMapping['projectName'] = index;
                if (column.roles['projectInfo']) columnMapping['projectInfo'] = index;
                if (column.roles['milestoneName']) columnMapping['milestoneName'] = index;
                if (column.roles['initialDate']) columnMapping['initialDate'] = index;
                if (column.roles['revisedDate']) columnMapping['revisedDate'] = index;
                if (column.roles['status']) columnMapping['status'] = index;
                if (column.roles['category']) columnMapping['category'] = index;
            }
        });

        const dataPoints: MilestoneDataPoint[] = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            const projectId = columnMapping['projectId'] !== undefined ?
                (row[columnMapping['projectId']] ? row[columnMapping['projectId']].toString() : "") : "";

            const projectName = columnMapping['projectName'] !== undefined ?
                (row[columnMapping['projectName']] ? row[columnMapping['projectName']].toString() : "") : "";

            const projectInfo = columnMapping['projectInfo'] !== undefined ?
                (row[columnMapping['projectInfo']] ? row[columnMapping['projectInfo']].toString() : "") : "";

            const milestoneName = columnMapping['milestoneName'] !== undefined ?
                (row[columnMapping['milestoneName']] ? row[columnMapping['milestoneName']].toString() : `Milestone ${i + 1}`) : `Milestone ${i + 1}`;

            const initialDate = columnMapping['initialDate'] !== undefined && row[columnMapping['initialDate']] ?
                new Date(row[columnMapping['initialDate']].toString()) : new Date();

            const revisedDate = columnMapping['revisedDate'] !== undefined && row[columnMapping['revisedDate']] ?
                new Date(row[columnMapping['revisedDate']].toString()) : null;

            const status = columnMapping['status'] !== undefined ?
                (row[columnMapping['status']] ? row[columnMapping['status']].toString() : "Planifié") : "Planifié";

            const category = columnMapping['category'] !== undefined ?
                (row[columnMapping['category']] ? row[columnMapping['category']].toString() : "Défaut") : "Défaut";

            dataPoints.push({
                projectId,
                projectName,
                projectInfo,
                milestoneName,
                initialDate,
                revisedDate,
                status,
                category
            });
        }

        return dataPoints;
    }

    private groupMilestonesByProject(milestones: MilestoneDataPoint[]): ProjectGroup[] {
        const projectMap = new Map<string, ProjectGroup>();

        milestones.forEach(m => {
            if (!projectMap.has(m.projectId)) {
                projectMap.set(m.projectId, {
                    projectId: m.projectId,
                    projectName: m.projectName,
                    projectInfo: m.projectInfo,
                    milestones: []
                });
            }
            projectMap.get(m.projectId)!.milestones.push(m);
        });

        // Trier les milestones de chaque projet par date initiale
        projectMap.forEach(group => {
            group.milestones.sort((a, b) =>
                a.initialDate.getTime() - b.initialDate.getTime()
            );
        });

        return Array.from(projectMap.values());
    }

    private createTrianglePath(centerX: number, centerY: number, size: number, direction: 'up' | 'down' = 'up'): string {
        const height = size;
        const width = size * 1.2;

        if (direction === 'up') {
            // Triangle pointant vers le haut: ▲
            return `M ${centerX},${centerY - height/2} L ${centerX - width/2},${centerY + height/2} L ${centerX + width/2},${centerY + height/2} Z`;
        } else {
            // Triangle pointant vers le bas: ▼
            return `M ${centerX},${centerY + height/2} L ${centerX - width/2},${centerY - height/2} L ${centerX + width/2},${centerY - height/2} Z`;
        }
    }

    private getColorByStatus(status: string): string {
        const statusLower = status.toLowerCase();

        if (statusLower.includes("red") || statusLower.includes("rouge")) {
            return this.formattingSettings.milestoneSettings.redColor.value.value;
        } else if (statusLower.includes("amber") || statusLower.includes("ambre") || statusLower.includes("orange")) {
            return this.formattingSettings.milestoneSettings.amberColor.value.value;
        } else if (statusLower.includes("green") || statusLower.includes("vert")) {
            return this.formattingSettings.milestoneSettings.greenColor.value.value;
        } else {
            // Par défaut: green
            return this.formattingSettings.milestoneSettings.greenColor.value.value;
        }
    }

    private wrapText(
        container: d3.Selection<SVGGElement, any, any, any>,
        text: string,
        x: number,
        y: number,
        maxWidth: number,
        fontSize: number,
        fill: string
    ): void {
        const words = text.split(/\s+/);
        let line: string[] = [];
        let lineNumber = 0;
        const lineHeight = fontSize * 1.2;
        const textAnchor = "end";

        const textElement = container.append("text")
            .attr("x", x)
            .attr("y", y)
            .attr("text-anchor", textAnchor)
            .attr("font-size", fontSize + "px")
            .attr("fill", fill);

        let tspan = textElement.append("tspan")
            .attr("x", x)
            .attr("dy", 0);

        // Estimation approximative de la largeur d'un caractère
        const charWidth = fontSize * 0.6;

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            line.push(word);
            const testLine = line.join(" ");
            const testWidth = testLine.length * charWidth;

            if (testWidth > maxWidth && line.length > 1) {
                // Retirer le dernier mot et créer une nouvelle ligne
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                lineNumber++;
                tspan = textElement.append("tspan")
                    .attr("x", x)
                    .attr("dy", lineHeight)
                    .text(word);
            } else {
                tspan.text(testLine);
            }
        }

        // Ajuster la position verticale pour centrer le bloc de texte
        const totalHeight = (lineNumber + 1) * lineHeight;
        const offsetY = -totalHeight / 2 + fontSize / 2;
        textElement.attr("transform", `translate(0, ${offsetY})`);
    }

    private renderRoadmap(width: number, height: number): void {
        const margin = { top: 80, right: 40, bottom: 30, left: 250 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const triangleSize = this.formattingSettings.milestoneSettings.triangleSize.value;
        const quarterHeaderHeight = this.formattingSettings.milestoneSettings.quarterHeaderHeight.value;
        const rowHeight = this.formattingSettings.milestoneSettings.rowHeight.value;

        // Collecter toutes les dates (initiales + révisées)
        const allDates: Date[] = [];
        this.dataPoints.forEach(m => {
            allDates.push(m.initialDate);
            if (m.revisedDate) {
                allDates.push(m.revisedDate);
            }
        });

        let startDate: Date;
        let endDate: Date;

        // Utiliser les paramètres de timeline si activés
        if (this.formattingSettings.timelineSettings.useCustomRange.value) {
            const startYear = this.formattingSettings.timelineSettings.startYear.value;
            const startMonth = this.formattingSettings.timelineSettings.startMonth.value - 1; // JavaScript months are 0-indexed
            const endYear = this.formattingSettings.timelineSettings.endYear.value;
            const endMonth = this.formattingSettings.timelineSettings.endMonth.value - 1;

            startDate = new Date(startYear, startMonth, 1);
            endDate = new Date(endYear, endMonth + 1, 0); // Last day of endMonth
        } else {
            // Utiliser les dates min/max des données
            const minDate = d3.min(allDates)!;
            const maxDate = d3.max(allDates)!;

            // Arrondir aux limites de mois
            startDate = d3.timeMonth.floor(minDate);
            endDate = d3.timeMonth.ceil(maxDate);
        }

        // Échelle temporelle
        const xScale = d3.scaleTime()
            .domain([startDate, endDate])
            .range([0, innerWidth]);

        // Nettoyer le conteneur
        this.container.selectAll("*").remove();

        // Positionner le conteneur
        this.container.attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Grouper les milestones par projet
        const projectGroups = this.groupMilestonesByProject(this.dataPoints);

        // Rendu des en-têtes trimestres
        this.renderQuarterHeaders(this.container, xScale, quarterHeaderHeight, innerWidth, innerHeight);

        // Rendu des milestones
        this.renderMilestones(this.container, projectGroups, xScale, rowHeight, triangleSize, innerWidth);

        // Rendu des lignes de connexion
        this.renderConnectingLines(this.container, projectGroups, xScale, rowHeight);
    }

    private renderQuarterHeaders(
        container: d3.Selection<SVGGElement, any, any, any>,
        xScale: d3.ScaleTime<number, number>,
        headerHeight: number,
        innerWidth: number,
        innerHeight: number
    ): void {
        const [startDate, endDate] = xScale.domain();

        // Générer les trimestres
        interface Quarter {
            year: number;
            quarter: number;
            startDate: Date;
            endDate: Date;
        }

        const quarters: Quarter[] = [];
        let current = new Date(startDate);

        while (current <= endDate) {
            const year = current.getFullYear();
            const quarter = Math.floor(current.getMonth() / 3) + 1;
            const qStart = new Date(year, (quarter - 1) * 3, 1);
            const qEnd = new Date(year, quarter * 3, 0);

            quarters.push({ year, quarter, startDate: qStart, endDate: qEnd });
            current = new Date(year, quarter * 3, 1); // Prochain trimestre
        }

        // Créer le groupe d'en-têtes
        const headerGroup = container.append("g")
            .attr("class", "quarter-headers")
            .attr("transform", `translate(0, ${-headerHeight - 10})`);

        // En-têtes des années (ligne du haut)
        const yearGroup = headerGroup.append("g").attr("class", "year-headers");
        const years = [...new Set(quarters.map(q => q.year))];

        years.forEach(year => {
            const yearQuarters = quarters.filter(q => q.year === year);
            const x1 = xScale(yearQuarters[0].startDate);
            const x2 = xScale(yearQuarters[yearQuarters.length - 1].endDate);

            yearGroup.append("rect")
                .attr("x", x1)
                .attr("y", 0)
                .attr("width", x2 - x1)
                .attr("height", headerHeight / 2)
                .attr("fill", "#f5f5f5")
                .attr("stroke", "#ccc");

            yearGroup.append("text")
                .attr("x", (x1 + x2) / 2)
                .attr("y", headerHeight / 4)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("font-size", "14px")
                .attr("font-weight", "bold")
                .text(year);
        });

        // En-têtes des trimestres (ligne du bas)
        const quarterGroup = headerGroup.append("g")
            .attr("class", "quarter-rows")
            .attr("transform", `translate(0, ${headerHeight / 2})`);

        quarters.forEach(q => {
            const x1 = xScale(q.startDate);
            const x2 = xScale(q.endDate);

            quarterGroup.append("rect")
                .attr("x", x1)
                .attr("y", 0)
                .attr("width", x2 - x1)
                .attr("height", headerHeight / 2)
                .attr("fill", "#fafafa")
                .attr("stroke", "#ccc");

            quarterGroup.append("text")
                .attr("x", (x1 + x2) / 2)
                .attr("y", headerHeight / 4)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("font-size", "12px")
                .text(`Q${q.quarter}`);
        });

        // Lignes verticales de séparation
        quarters.forEach(q => {
            container.append("line")
                .attr("class", "quarter-separator")
                .attr("x1", xScale(q.startDate))
                .attr("x2", xScale(q.startDate))
                .attr("y1", -headerHeight - 10)
                .attr("y2", innerHeight)
                .attr("stroke", "#ddd")
                .attr("stroke-width", 1);
        });
    }

    private renderMilestones(
        container: d3.Selection<SVGGElement, any, any, any>,
        projectGroups: ProjectGroup[],
        xScale: d3.ScaleTime<number, number>,
        rowHeight: number,
        triangleSize: number,
        innerWidth: number
    ): void {
        let currentY = 0;

        projectGroups.forEach(project => {
            // Ligne d'en-tête du projet
            const projectHeaderGroup = container.append("g")
                .attr("class", "project-header")
                .attr("transform", `translate(0, ${currentY})`);

            // Rectangle de fond pour l'en-tête du projet
            projectHeaderGroup.append("rect")
                .attr("x", -250)
                .attr("y", 0)
                .attr("width", innerWidth + 250)
                .attr("height", rowHeight)
                .attr("fill", this.formattingSettings.milestoneSettings.projectBackgroundColor.value.value)
                .attr("stroke", "#ccc");

            // Nom du projet (en gras)
            projectHeaderGroup.append("text")
                .attr("x", -230)
                .attr("y", rowHeight / 2)
                .attr("dominant-baseline", "middle")
                .attr("font-size", this.formattingSettings.milestoneSettings.projectFontSize.value + "px")
                .attr("font-weight", "bold")
                .attr("fill", "#333")
                .text(`${project.projectId} - ${project.projectName}  (${project.projectInfo})`);

            currentY += rowHeight; // Incrémenter pour l'en-tête du projet

            // Rendu de chaque milestone du projet
            project.milestones.forEach((milestone, idx) => {
                const milestoneY = currentY + idx * rowHeight;

                const milestoneGroup = container.append("g")
                    .attr("class", "milestone")
                    .attr("transform", `translate(0, ${milestoneY})`);

                // Rectangle de fond
                const bgColor = idx % 2 === 0 ?
                    this.formattingSettings.milestoneSettings.milestoneBackgroundColor1.value.value :
                    this.formattingSettings.milestoneSettings.milestoneBackgroundColor2.value.value;

                milestoneGroup.append("rect")
                    .attr("x", -250)
                    .attr("y", 0)
                    .attr("width", innerWidth + 250)
                    .attr("height", rowHeight)
                    .attr("fill", bgColor)
                    .attr("stroke", "#eee");

                // Déterminer la couleur basée sur le statut
                const triangleColor = this.getColorByStatus(milestone.status);

                // Triangle date initiale
                const initialX = xScale(milestone.initialDate);
                milestoneGroup.append("path")
                    .attr("class", "milestone-initial")
                    .attr("d", this.createTrianglePath(initialX, rowHeight / 2, triangleSize, 'up'))
                    .attr("fill", triangleColor)
                    .attr("stroke", "#555")
                    .attr("stroke-width", 1);

                // Tooltip pour date initiale
                milestoneGroup.append("title")
                    .text(`${milestone.milestoneName}\nStatut: ${milestone.status}\nDate initiale: ${d3.timeFormat("%d %b %Y")(milestone.initialDate)}`);

                // Label date initiale
                milestoneGroup.append("text")
                    .attr("x", initialX)
                    .attr("y", rowHeight / 2 - triangleSize / 2 - 4)
                    .attr("text-anchor", "middle")
                    .attr("font-size", "9px")
                    .attr("fill", "#666")
                    .text(d3.timeFormat("%b %Y")(milestone.initialDate));

                // Triangle date révisée si existe
                if (milestone.revisedDate) {
                    const revisedX = xScale(milestone.revisedDate);
                    milestoneGroup.append("path")
                        .attr("class", "milestone-revised")
                        .attr("d", this.createTrianglePath(revisedX, rowHeight / 2, triangleSize, 'up'))
                        .attr("fill", triangleColor)
                        .attr("stroke", "#555")
                        .attr("stroke-width", 1);

                    // Label date révisée
                    milestoneGroup.append("text")
                        .attr("x", revisedX)
                        .attr("y", rowHeight / 2 + triangleSize / 2 + 12)
                        .attr("text-anchor", "middle")
                        .attr("font-size", "9px")
                        .attr("fill", "#666")
                        .text(d3.timeFormat("%b %Y")(milestone.revisedDate));
                }

                // Nom du milestone avec retour à la ligne automatique
                this.wrapText(
                    milestoneGroup,
                    milestone.milestoneName,
                    -10,
                    rowHeight / 2,
                    220, // Largeur maximale pour le texte
                    this.formattingSettings.milestoneSettings.milestoneFontSize.value,
                    "#555"
                );
            });

            currentY += project.milestones.length * rowHeight;
        });
    }

    private renderConnectingLines(
        container: d3.Selection<SVGGElement, any, any, any>,
        projectGroups: ProjectGroup[],
        xScale: d3.ScaleTime<number, number>,
        rowHeight: number
    ): void {
        if (!this.formattingSettings.milestoneSettings.showConnectingLines.value) {
            return;
        }

        // Définir le marker de flèche
        const defs = container.append("defs");
        defs.append("marker")
            .attr("id", "arrow")
            .attr("markerWidth", 10)
            .attr("markerHeight", 10)
            .attr("refX", 8)
            .attr("refY", 3)
            .attr("orient", "auto")
            .attr("markerUnits", "strokeWidth")
            .append("path")
            .attr("d", "M0,0 L0,6 L9,3 z")
            .attr("fill", "#999");

        const linesGroup = container.append("g").attr("class", "connecting-lines");

        let currentY = 0;

        projectGroups.forEach(project => {
            // Sauter la ligne d'en-tête du projet
            currentY += rowHeight;

            // Tracer une flèche entre la date initiale et la date révisée du même milestone
            project.milestones.forEach((milestone, idx) => {
                // Vérifier si le milestone a une date révisée
                if (milestone.revisedDate) {
                    const x1 = xScale(milestone.initialDate);
                    const y1 = currentY + idx * rowHeight + rowHeight / 2;
                    const x2 = xScale(milestone.revisedDate);
                    const y2 = currentY + idx * rowHeight + rowHeight / 2; // Même ligne

                    // Créer une ligne horizontale avec flèche
                    const pathData = `M ${x1},${y1} L ${x2},${y2}`;

                    linesGroup.append("path")
                        .attr("d", pathData)
                        .attr("fill", "none")
                        .attr("stroke", "#999")
                        .attr("stroke-width", 1.5)
                        .attr("stroke-dasharray", "4,3")
                        .attr("marker-end", "url(#arrow)");
                }
            });

            currentY += project.milestones.length * rowHeight;
        });
    }

    private renderEmptyState(width: number, height: number): void {
        this.container.selectAll("*").remove();

        this.container.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("fill", "#666")
            .text("Ajoutez des données pour afficher la roadmap");
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}
