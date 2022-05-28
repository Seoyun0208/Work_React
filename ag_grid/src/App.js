import "./App.css";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import MyFilter from "./components/Filter";

let yearType = "default";

function App() {
	const gridRef = useRef();

	// ! useState() 를 이용한 행 설정
	const [rowData, setRowData] = useState([]);

	// ! useState() 를 이용한 열 설정
	// field : 필수값, 필드명 설정
	// sortable : 정렬기능 사용여부 설정
	// filter : 필터기능 사용여부 설정
	const [columnDefs, setColumnDefs] = useState([
		// { field: "athlete" , sortable: true, filter: true},
		{
			field: "athlete",
			width: 250,
		},
		{
			field: "age",
			width: 100,
			filter: MyFilter,
			filterParams: {
				title: "My age Filter",
				values: [20, 30, 40, 50, 60],
			},
		},
		{
			field: "country",
			width: 200,
		},
		{
			field: "year",
			width: 100,
		},
	]);

	// ! useMemo() 를 이용하여 일부 기능들의 기본 사용여부 설정
	// 따라서 columnDefs 에 기본으로 사용할 기능들을 일일이 작성하지 않아도 됨!
	const defaultColDef = useMemo(
		() => ({
			sortable: true,
			filter: true,
			suppressMenu: true, // floatMenu 버튼 숨기기
		}),
		[]
	);

	// ! 셀 클릭시 이벤트 설정
	const cellClickedListener = useCallback((e) => {
		console.log("cellClicked", e);
	});

	// ! useEffect() 를 통해 데이터 가져오기
	// 가져온 데이터는 rowData 에 담아주면 됨!
	useEffect(() => {
		fetch("https://www.ag-grid.com/example-assets/olympic-winners.json")
			.then((result) => result.json())
			.then((rowData) => setRowData(rowData));
	}, []);

	// ! DeSelectAll 버튼 이벤트
	const DeSelectAll = useCallback((e) => gridRef.current.api.deselectAll());

	// ! 현재 필터 상태 저장 및 저장된 필터 상태로 복구하는 버튼 이벤트
	const filterState = useRef();

	const onBtSave = useCallback(() => {
		filterState.current = gridRef.current.api.getFilterModel(
			console.log("saving", filterState.current)
		);
	});

	const onBtRestore = useCallback(() => {
		console.log("restoring", filterState.current);
		gridRef.current.api.setFilterModel(filterState.current);
	});

	// ! externalFilter 사용한 년도별 필터링 조회 버튼 기능 구현
	const externalFilterChanged = useCallback(() => {
		const value = document.querySelector("#year");
		const selectedValue = value.options[value.selectedIndex].value;
		console.log(selectedValue);
		yearType = selectedValue;
		gridRef.current.api.onFilterChanged();
	}, []);

	const isExternalFilterPresent = useCallback(() => {
		// if yearType is not default, then we are filtering
		return yearType !== "default";
	}, []);

	const doesExternalFilterPass = useCallback(
		(node) => {
			switch (yearType) {
				case "2000":
					return node.data.year == 2000;
				case "2004":
					return node.data.year == 2004;
				case "2008":
					return node.data.year == 2008;
				case "2012":
					return node.data.year == 2012;
				default:
					return true;
			}
		},
		[yearType]
	);

	return (
		<div>
			<div
				style={{
					width: 700,
					textAlign: "right",
					margin: "50px auto 5px auto",
				}}
			>
				<button style={{ marginRight: 5 }} onClick={onBtSave}>
					Save
				</button>
				<button style={{ marginRight: 5 }} onClick={onBtRestore}>
					Restore
				</button>
			</div>
			<div
				className="ag-theme-alpine" // 테마 설정
				style={{
					width: 700,
					height: 600,
					margin: "auto",
					textAlign: "center",
				}} // 스타일 지정
			>
				<div
					className="buttons"
					style={{
						width: 700,
						padding: "10px 0 5px 0",
						margin: "auto",
						display: "flex",
						justifyContent: "space-between",
					}}
				>
					<div>
						<select
							id="year"
							style={{ width: 80, height: 22, marginRight: 5 }}
							defaultValue="default"
						>
							<option value="default">전년도</option>
							<option value="2000">2000년도</option>
							<option value="2004">2004년도</option>
							<option value="2008">2008년도</option>
							<option value="2012">2012년도</option>
						</select>
						<button
							onClick={externalFilterChanged}
							style={{ marginLeft: 5 }}
						>
							Search
						</button>
					</div>
					<button style={{ marginLeft: 30 }} onClick={DeSelectAll}>
						DeSelectAll
					</button>
				</div>
				<AgGridReact
					rowData={rowData}
					columnDefs={columnDefs}
					defaultColDef={defaultColDef}
					rowSelection="multiple" // shift 키와 함께 다중 선택 가능
					animateRows={true} // 기능 사용시 애니메이션 효과 발생
					onCellClicked={cellClickedListener} // 셀 클릭시 이벤트 설정 가능
					ref={gridRef}
					isExternalFilterPresent={isExternalFilterPresent}
					doesExternalFilterPass={doesExternalFilterPass}
				/>
			</div>
		</div>
	);
}

export default App;
