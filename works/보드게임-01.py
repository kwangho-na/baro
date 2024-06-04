using UnityEngine;

public class BoardManager : MonoBehaviour
{
    public int rows = 8;
    public int cols = 8;
    public GameObject[] tiles;
    private GameObject[,] board;

    void Start()
    {
        board = new GameObject[rows, cols];
        CreateBoard();
    }

    void CreateBoard()
    {
        for (int row = 0; row < rows; row++)
        {
            for (int col = 0; col < cols; col++)
            {
                Vector2 position = new Vector2(col, row);
                int tileIndex = Random.Range(0, tiles.Length);
                GameObject tile = Instantiate(tiles[tileIndex], position, Quaternion.identity);
                board[row, col] = tile;
                tile.GetComponent<Tile>().Init(row, col, this);
            }
        }
    }

    public void SwapTiles(Tile tile1, Tile tile2)
    {
        int row1 = tile1.row;
        int col1 = tile1.col;
        int row2 = tile2.row;
        int col2 = tile2.col;

        board[row1, col1] = tile2.gameObject;
        board[row2, col2] = tile1.gameObject;

        tile1.SwapPosition(tile2);
    }
}

using UnityEngine;

public class Tile : MonoBehaviour
{
    public int row;
    public int col;
    private BoardManager boardManager;

    private void OnMouseDown()
    {
        if (boardManager.selectedTile == null)
        {
            boardManager.selectedTile = this;
        }
        else
        {
            if (IsAdjacent(boardManager.selectedTile))
            {
                boardManager.SwapTiles(this, boardManager.selectedTile);
                boardManager.selectedTile = null;
            }
            else
            {
                boardManager.selectedTile = this;
            }
        }
    }

    public void Init(int row, int col, BoardManager boardManager)
    {
        this.row = row;
        this.col = col;
        this.boardManager = boardManager;
    }

    public void SwapPosition(Tile other)
    {
        int tempRow = row;
        int tempCol = col;
        row = other.row;
        col = other.col;
        other.row = tempRow;
        other.col = tempCol;

        Vector2 tempPosition = transform.position;
        transform.position = other.transform.position;
        other.transform.position = tempPosition;
    }

    private bool IsAdjacent(Tile other)
    {
        return (Mathf.Abs(row - other.row) == 1 && col == other.col) ||
               (Mathf.Abs(col - other.col) == 1 && row == other.row);
    }
}

## 매치 효과주기
using UnityEngine;

public class TileEffectHandler : MonoBehaviour
{
    public GameObject matchEffectPrefab; // 매치 효과 프리팹

    // 타일 매치 시 호출되는 함수
    public void PlayMatchEffect(Vector3 position)
    {
        GameObject effect = Instantiate(matchEffectPrefab, position, Quaternion.identity);
        Destroy(effect, 2f); // 2초 후 효과 제거
    }
}

## 파티클



## python 소스
import random

# 보드 크기 설정
ROWS = 8
COLS = 8
COLORS = ['R', 'G', 'B', 'Y', 'P', 'O']  # Red, Green, Blue, Yellow, Purple, Orange

def create_board():
    board = [[random.choice(COLORS) for _ in range(COLS)] for _ in range(ROWS)]
    return board

def print_board(board):
    for row in board:
        print(' '.join(row))
    print()

def find_matches(board):
    matches = []
    # 가로 매치 찾기
    for row in range(ROWS):
        for col in range(COLS - 2):
            if board[row][col] == board[row][col + 1] == board[row][col + 2]:
                matches.append((row, col))
                matches.append((row, col + 1))
                matches.append((row, col + 2))
    # 세로 매치 찾기
    for col in range(COLS):
        for row in range(ROWS - 2):
            if board[row][col] == board[row + 1][col] == board[row + 2][col]:
                matches.append((row, col))
                matches.append((row + 1, col))
                matches.append((row + 2, col))
    return matches

def remove_matches(board, matches):
    for (row, col) in matches:
        board[row][col] = None

def drop_pieces(board):
    for col in range(COLS):
        empty_spots = 0
        for row in range(ROWS - 1, -1, -1):
            if board[row][col] is None:
                empty_spots += 1
            elif empty_spots > 0:
                board[row + empty_spots][col] = board[row][col]
                board[row][col] = None

def fill_empty_spots(board):
    for row in range(ROWS):
        for col in range(COLS):
            if board[row][col] is None:
                board[row][col] = random.choice(COLORS)

# 게임 보드 생성 및 출력
board = create_board()
print("초기 보드:")
print_board(board)

# 매치 찾기 및 제거
matches = find_matches(board)
while matches:
    remove_matches(board, matches)
    drop_pieces(board)
    fill_empty_spots(board)
    matches = find_matches(board)

print("최종 보드:")
print_board(board)
