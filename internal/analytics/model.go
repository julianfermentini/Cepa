package analytics

// OverviewStats métricas generales de la bodega.
type OverviewStats struct {
	TotalScans    int `json:"total_scans"`
	LotsScanned   int `json:"lots_scanned"`
	Countries     int `json:"countries"`
	ScansLast30d  int `json:"scans_last_30d"`
}

// TopLot lote con mayor cantidad de escaneos.
type TopLot struct {
	LotID     string `json:"lot_id"`
	Name      string `json:"name"`
	Variety   string `json:"variety,omitempty"`
	ScanCount int    `json:"scan_count"`
}

// CountryStat escaneos por país.
type CountryStat struct {
	CountryCode string `json:"country_code"`
	ScanCount   int    `json:"scan_count"`
}
