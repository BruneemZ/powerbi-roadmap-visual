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

        if (statusLower.includes("planif") || statusLower.includes("planned")) {
            return this.formattingSettings.milestoneSettings.plannedColor.value.value;
        } else if (statusLower.includes("cours") || statusLower.includes("progress")) {
            return this.formattingSettings.milestoneSettings.inProgressColor.value.value;
        } else if (statusLower.includes("termin") || statusLower.includes("complet") || statusLower.includes("done")) {
            return this.formattingSettings.milestoneSettings.completedColor.value.value;
        } else {
            // Par défaut: planifié
            return this.formattingSettings.milestoneSettings.plannedColor.value.value;
        }
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

        // Utiliser les dates min/max des données
        const minDate = d3.min(allDates)!;
        const maxDate = d3.max(allDates)!;

        // Arrondir aux limites de mois
        const startDate = d3.timeMonth.floor(minDate);
        const endDate = d3.timeMonth.ceil(maxDate);

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
            // Groupe pour le projet
            const projectGroup = container.append("g")
                .attr("class", "project-group")
                .attr("transform", `translate(0, ${currentY})`);

            // Labels du projet (colonne de gauche)
            projectGroup.append("text")
                .attr("x", -220)
                .attr("y", rowHeight / 2)
                .attr("font-size", "11px")
                .attr("font-weight", "bold")
                .text(`${project.projectId} - ${project.projectName}`);

            projectGroup.append("text")
                .attr("x", -220)
                .attr("y", rowHeight / 2 + 14)
                .attr("font-size", "9px")
                .attr("fill", "#666")
                .text(project.projectInfo);

            // Rendu de chaque milestone du projet
            project.milestones.forEach((milestone, idx) => {
                const milestoneY = currentY + idx * rowHeight;

                const milestoneGroup = container.append("g")
                    .attr("class", "milestone")
                    .attr("transform", `translate(0, ${milestoneY})`);

                // Rectangle de fond
                milestoneGroup.append("rect")
                    .attr("x", -250)
                    .attr("y", 0)
                    .attr("width", innerWidth + 250)
                    .attr("height", rowHeight)
                    .attr("fill", idx % 2 === 0 ? "#fafafa" : "#fff")
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

                // Nom du milestone (aligné à droite avant la timeline)
                milestoneGroup.append("text")
                    .attr("x", -10)
                    .attr("y", rowHeight / 2)
                    .attr("text-anchor", "end")
                    .attr("dominant-baseline", "middle")
                    .attr("font-size", "10px")
                    .text(milestone.milestoneName);
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
            // Trier les milestones par date effective (révisée si existe, sinon initiale)
            const sortedMilestones = [...project.milestones].sort((a, b) => {
                const dateA = a.revisedDate || a.initialDate;
                const dateB = b.revisedDate || b.revisedDate;
                return dateA.getTime() - dateB.getTime();
            });

            // Tracer les lignes entre milestones consécutifs
            for (let i = 0; i < sortedMilestones.length - 1; i++) {
                const current = sortedMilestones[i];
                const next = sortedMilestones[i + 1];

                // Utiliser date révisée si disponible, sinon initiale
                const currentDate = current.revisedDate || current.initialDate;
                const nextDate = next.revisedDate || next.initialDate;

                // Trouver l'index dans le tableau original pour calculer le Y
                const currentIdx = project.milestones.indexOf(current);
                const nextIdx = project.milestones.indexOf(next);

                const x1 = xScale(currentDate);
                const y1 = currentY + currentIdx * rowHeight + rowHeight / 2;
                const x2 = xScale(nextDate);
                const y2 = currentY + nextIdx * rowHeight + rowHeight / 2;

                // Créer un chemin courbe
                const midX = (x1 + x2) / 2;
                const controlY = Math.min(y1, y2) - 20;
                const pathData = `M ${x1},${y1} Q ${midX},${controlY} ${x2},${y2}`;

                linesGroup.append("path")
                    .attr("d", pathData)
                    .attr("fill", "none")
                    .attr("stroke", "#999")
                    .attr("stroke-width", 1.5)
                    .attr("stroke-dasharray", "4,3")
                    .attr("marker-end", "url(#arrow)");
            }

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
