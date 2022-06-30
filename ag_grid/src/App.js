import "./App.css";
import React, {
	forwardRef,
	memo,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
	useCallback,
} from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import MyFilter from "./components/Filter";
import { GridApi } from "ag-grid-community";
import { ICellRendererParams } from "ag-grid-community";

let yearType = "default";

function App() {
	const gridRef = useRef();

	// ! edit 할 때 숫자만 입력받는 기능 구현
	const KEY_BACKSPACE = "Backspace";
	const KEY_DELETE = "Delete";
	const KEY_F2 = "F2";
	const KEY_ENTER = "Enter";
	const KEY_TAB = "Tab";

	const NumericEditor = memo(
		forwardRef((props, ref) => {
			const createInitialState = () => {
				let startValue;

				if (props.key === KEY_BACKSPACE || props.key === KEY_DELETE) {
					// if backspace or delete pressed, we clear the cell
					startValue = "";
				} else if (props.charPress) {
					// if a letter was pressed, we start with the letter
					startValue = props.charPress;
				} else {
					// otherwise we start with the current value
					startValue = props.value;
					if (props.key === KEY_F2) {
					}
				}

				return {
					value: startValue,
				};
			};

			const initialState = createInitialState();
			const [value, setValue] = useState(initialState.value);
			const refInput = useRef(null);

			// focus on the input
			useEffect(() => {
				// get ref from React component
				const eInput = refInput.current;
				eInput.focus();

				// when we started editing, we want the caret at the end, not the start.
				// this comes into play in two scenarios:
				//   a) when user hits F2
				//   b) when user hits a printable character
				const length = eInput.value ? eInput.value.length : 0;
				if (length > 0) {
					eInput.setSelectionRange(length, length);
				}
			}, []);

			/* Utility Methods */
			const isLeftOrRight = (event) => {
				return ["ArrowLeft", "ArrowLeft"].indexOf(event.key) > -1;
			};

			const isCharNumeric = (charStr) => {
				return !!/\d/.test(charStr);
			};

			const isKeyPressedNumeric = (event) => {
				const charStr = event.key;
				return isCharNumeric(charStr);
			};

			const deleteOrBackspace = (event) => {
				return [KEY_DELETE, KEY_BACKSPACE].indexOf(event.key) > -1;
			};

			const finishedEditingPressed = (event) => {
				const key = event.key;
				return key === KEY_ENTER || key === KEY_TAB;
			};

			const onKeyDown = (event) => {
				if (isLeftOrRight(event) || deleteOrBackspace(event)) {
					event.stopPropagation();
					return;
				}

				if (
					!finishedEditingPressed(event) &&
					!isKeyPressedNumeric(event)
				) {
					if (event.preventDefault) event.preventDefault();
				}

				if (finishedEditingPressed(event)) {
					props.stopEditing();
				}
			};

			/* Component Editor Lifecycle methods */
			useImperativeHandle(ref, () => {
				return {
					// the final value to send to the grid, on completion of editing
					getValue() {
						return value;
					},
				};
			});

			return (
				<input
					ref={refInput}
					value={value}
					onChange={(event) => setValue(event.target.value)}
					onKeyDown={(event) => onKeyDown(event)}
					style={{
						width: "50%",
						outline: "none",
						border: "none",
						background: "transparent",
						textAlign: "center",
					}}
				/>
			);
		})
	);

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
			cellEditor: NumericEditor,
		},
		{
			field: "country",
			width: 200,
		},
		{
			field: "year",
			width: 100,
			cellEditor: NumericEditor,
		},
	]);

	// ! useMemo() 를 이용하여 일부 기능들의 기본 사용여부 설정
	// 따라서 columnDefs 에 기본으로 사용할 기능들을 일일이 작성하지 않아도 됨!
	const defaultColDef = useMemo(
		() => ({
			sortable: true,
			filter: true,
			suppressMenu: true, // floatMenu 버튼 숨기기
			editable: true,
			singleClickEdit: true,
		}),
		[]
	);

	// ! 셀 클릭시 이벤트 설정
	const cellClickedListener = useCallback((e) => {
		// console.log("cellClicked", e);
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

	// ! 수정 중이던 셀 포커스 잃게 하는 EditStop 버튼 기능 구현
	const onBtStopEditing = useCallback((event) => {
		console.log(event);
		gridRef.current.api.stopEditing();
	}, []);

	return (
		<div>
			<div
				style={{
					width: 700,
					textAlign: "right",
					margin: "50px auto 5px auto",
				}}
			>
				<button style={{ marginRight: 5 }} onClick={onBtStopEditing}>
					EditStop
				</button>
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
					stopEditingWhenCellsLoseFocus={true}
				/>
			</div>
		</div>
	);
}

export default App;
